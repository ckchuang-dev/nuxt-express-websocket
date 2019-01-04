const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const express = require('express')
const router = express.Router()
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 3000
const JSON_SERVER_URL = 'http://localhost:4000'
const axios = require('axios')

const api = require('./api')

app.set('port', port)

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  // Import API Routes
  app.use('/api', api)
  app.use('/', router)

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  server.listen(port)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })

  // Socket.io

  // Chat room
  // let connectionList = {}

  // io.on('connection', function(socket) {
  //   console.log('connect')
  //   const socketId = socket.id
  //   connectionList[socketId] = {
  //     socket: socket
  //   }
  //   socket.on('join', function(data) {
  //     data.userCount = Object.keys(connectionList).length
  //     socket.broadcast.emit('broadcast_join', data)
  //     connectionList[socketId].username = data.username
  //   })
  //   socket.on('disconnect', function() {
  //     if (connectionList[socketId].username) {
  //       socket.broadcast.emit('broadcast_quit', {
  //         userCount: Object.keys(connectionList).length - 1,
  //         username: connectionList[socketId].username
  //       })
  //     }
  //     delete connectionList[socketId]
  //   })

  //   socket.on('chat_message', function(msg) {
  //     socket.broadcast.emit('chat_message', msg)
  //   })
  // })

  // Guessing number
  const getUsers = async () => {
    try {
      const ret = await axios.get(`${JSON_SERVER_URL}/users`)
      return ret && ret.data ? ret.data : null
    } catch (error) {
      console.error(error)
    }
  }

  const updateUser = async user => {
    try {
      const ret = await axios.put(`${JSON_SERVER_URL}/users/${user.id}`, user)
      return ret
    } catch (error) {
      console.error(error)
    }
  }

  const getRooms = async () => {
    try {
      const ret = await axios.get(`${JSON_SERVER_URL}/rooms`)
      return ret && ret.data ? ret.data : null
    } catch (error) {
      console.error(error)
    }
  }

  const updateRoom = async room => {
    try {
      const ret = await axios.patch(`${JSON_SERVER_URL}/rooms/${room.id}`, room)
      return ret
    } catch (error) {
      console.error(error)
    }
  }

  io.on('connection', async function(socket) {
    let user = null
    let rooms = await getRooms()
    let users = await getUsers()
    const socketId = socket.id
    console.log(`${socketId} connected!`)

    socket.on('LOGIN_USER', async function(inputUser) {
      users = await getUsers()
      if (users) {
        for (let i = 0; i < users.length; i++) {
          if (users[i].account === inputUser.account) {
            if (users[i].password !== inputUser.password) {
              io.to(socketId).emit('LOGIN_FAIL', '密碼錯誤！')
            } else if (users[i].isOnline) {
              io.to(socketId).emit('LOGIN_FAIL', '有其他使用者登入中！')
            } else {
              user = {
                ...users[i],
                isOnline: true,
                socketId: socketId
              }
              await updateUser(user)
              io.to(socketId).emit('LOGIN_SUCCESS')
            }
          }
        }
      }
    })

    socket.on('LOGIN_SUCCESS', function() {
      if (user) {
        io.to(socketId).emit('INIT_USER_DATA', user)
      } else {
        io.to(socketId).emit('LOGIN_FAIL', '你尚未登入！')
      }
    })
    socket.on('LOGOUT_USER', function() {
      if (user) {
        user.isOnline = false
        user.socketId = ''
        updateUser(user)
      }
    })

    socket.on('disconnect', async function() {
      if (user) {
        if (user.roomId) {
          leaveRoom(user.roomId)
        }
        user.isOnline = false
        user.socketId = ''
        await updateUser(user)
      }
    })

    // 遊戲大廳
    socket.on('JOIN_ROOM', async function(roomId) {
      rooms = await getRooms()
      const index = roomId - 1
      if (rooms && rooms[index]) {
        if (rooms[index].player1 && rooms[index].player2) {
          io.to(socketId).emit('JOIN_ROOM_FAIL', '房間已滿！')
        } else {
          if (!rooms[index].player1) {
            let room = {
              ...rooms[index],
              player1: user
            }
            await updateRoom(room)
          } else if (!rooms[index].player2) {
            let room = {
              ...rooms[index],
              player2: user
            }
            await updateRoom(room)
          }
          socket.join(roomId)
          user.roomId = roomId
          await updateUser(user)
          io.to(socketId).emit('JOIN_ROOM_SUCCESS', roomId)
          if (user && user.nickname) {
            socket
              .to(roomId)
              .emit('SYSTEM_LOG', `${user.nickname} 加入了房間`, rooms[roomId])
            console.log(`${user.nickname} 加入了 ${roomId}`)
          }
          rooms = await getRooms()
        }
      }
    })

    async function leaveRoom(roomId) {
      rooms = await getRooms()
      const index = roomId - 1
      if (rooms && rooms[index]) {
        if (
          rooms[index].player1 &&
          rooms[index].player1.socketId &&
          rooms[index].player1.socketId === socketId
        ) {
          let room = {
            ...rooms[index],
            player1: null
          }
          await updateRoom(room)
        } else if (
          rooms[index].player2 &&
          rooms[index].player2.socketId &&
          rooms[index].player2.socketId === socketId
        ) {
          let room = {
            ...rooms[index],
            player2: null
          }
          await updateRoom(room)
        }
        socket.leave(roomId)
        delete user.roomId
        await updateUser(user)

        if (user && user.nickname) {
          socket
            .to(roomId)
            .emit('SYSTEM_LOG', `${user.nickname} 退出了房間`, rooms[roomId])
          console.log(`${user.nickname} 退出了 ${roomId}`)
        }
        rooms = await getRooms()
      }
    }

    // 遊戲房內
    socket.on('LEAVE_ROOM', function(roomId) {
      leaveRoom(roomId)
    })
    socket.on('SEND_TARGET', async function(target) {
      const index = user.roomId - 1
      rooms = await getRooms()
      if (user && user.roomId && user.nickname && rooms && rooms[index]) {
        if (
          rooms[index].player1 &&
          socketId === rooms[index].player1.socketId
        ) {
          let room = {
            ...rooms[index],
            player1: {
              ...rooms[index].player1,
              target: target
            }
          }
          await updateRoom(room)
        } else if (
          rooms[index].player2 &&
          socketId === rooms[index].player2.socketId
        ) {
          let room = {
            ...rooms[index],
            player2: {
              ...rooms[index].player2,
              target: target
            }
          }
          await updateRoom(room)
        }
        io.in(user.roomId).emit(
          'SYSTEM_LOG',
          `${user.nickname} 送出了給對手的猜測值！`,
          rooms[user.roomId]
        )
        console.log(`${user.nickname} 送出了他給對手的猜測值： ${target}`)
      }
    })
    socket.on('SEND_READY_STATUS', async function(ready) {
      const index = user.roomId - 1
      rooms = await getRooms()
      if (user && user.roomId && user.nickname && rooms && rooms[index]) {
        if (
          rooms[index].player1 &&
          socketId === rooms[index].player1.socketId
        ) {
          let room = {
            ...rooms[index],
            player1: {
              ...rooms[index].player1,
              ready: ready
            }
          }
          await updateRoom(room)
        } else if (
          rooms[index].player2 &&
          socketId === rooms[index].player2.socketId
        ) {
          let room = {
            ...rooms[index],
            player2: {
              ...rooms[index].player2,
              ready: ready
            }
          }
          await updateRoom(room)
        }
        if (ready) {
          io.in(user.roomId).emit(
            'SYSTEM_LOG',
            `${user.nickname} 已準備就緒！`,
            rooms[user.roomId]
          )
        } else {
          io.in(user.roomId).emit(
            'SYSTEM_LOG',
            `等...等等一下，${user.nickname} 已取消準備！`,
            rooms[user.roomId]
          )
        }
        rooms = await getRooms()
        if (rooms && rooms[index] && rooms[index].player1) {
          if (
            rooms[index].player1.ready &&
            rooms[index].player2 &&
            rooms[index].player2.ready
          ) {
            io.to(rooms[index].player1.socketId).emit('IS_ROOM_MANAGER', true)
          } else {
            io.to(rooms[index].player1.socketId).emit('IS_ROOM_MANAGER', false)
          }
        }
      }
    })

    // 對戰開始
    socket.on('START_GAME', function() {
      const index = user.roomId - 1
      io.in(user.roomId).emit('SYSTEM_LOG', `對戰開始！`, rooms[user.roomId])
      io.to(rooms[index].player1.socketId).emit(
        'SEND_GUESSING_TARGET',
        rooms[index].player2.target
      )
      io.to(rooms[index].player2.socketId).emit(
        'SEND_GUESSING_TARGET',
        rooms[index].player1.target
      )
    })
    socket.on('SEND_GUESSING', async function(guessing, isPlayer1) {
      const index = user.roomId - 1
      rooms = await getRooms()
      if (isPlayer1) {
        io.in(user.roomId).emit(
          'SYSTEM_LOG',
          `${rooms[index].player1.nickname} 猜了 「${guessing}」`,
          rooms[user.roomId]
        )
        io.to(rooms[index].player2.socketId).emit('CHANGE_TURN')
      } else {
        io.in(user.roomId).emit(
          'SYSTEM_LOG',
          `${rooms[index].player2.nickname} 猜了 「${guessing}」`,
          rooms[user.roomId]
        )
        io.to(rooms[index].player1.socketId).emit('CHANGE_TURN')
      }
    })
  })
}
start()
