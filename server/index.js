const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const express = require('express')
const router = express.Router()
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 3000
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
      const ret = await axios.get('http://localhost:4000/users')
      return ret && ret.data ? ret.data : null
    } catch (error) {
      console.error(error)
    }
  }

  const updateUser = async user => {
    try {
      const ret = await axios.patch(
        `http://localhost:4000/users/${user.id}`,
        user
      )
      return ret
    } catch (error) {
      console.error(error)
    }
  }

  const getRooms = async () => {
    try {
      const ret = await axios.get('http://localhost:4000/rooms')
      return ret && ret.data ? ret.data : null
    } catch (error) {
      console.error(error)
    }
  }

  const updateRoom = async room => {
    try {
      const ret = await axios.patch(
        `http://localhost:4000/rooms/${room.id}`,
        room
      )
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

    // TODO: 使用者關閉視窗時，若是在房間內，需清空 server 端關於此使用者的房間資料
    socket.on('disconnect', async function() {
      if (user) {
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
            console.log('加入player1')
            let room = {
              ...rooms[index],
              player1: user
            }
            await updateRoom(room)
          } else if (!rooms[index].player2) {
            console.log('加入player2')
            let room = {
              ...rooms[index],
              player2: user
            }
            await updateRoom(room)
          }
          socket.join(roomId)
          io.to(socketId).emit('JOIN_ROOM_SUCCESS', roomId)
          if (user && user.nickname) {
            socket
              .to(roomId)
              .emit('sys', `${user.nickname} 加入了房間`, rooms[roomId])
            console.log(`${user.nickname} 加入了 ${roomId}`)
          }
          rooms = await getRooms()
        }
      }
    })

    // 遊戲房內
    socket.on('LEAVE_ROOM', async function(roomId) {
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
        if (user && user.nickname) {
          socket
            .to(roomId)
            .emit('sys', `${user.nickname} 退出了房間`, rooms[roomId])
          console.log(`${user.nickname} 退出了 ${roomId}`)
        }
        rooms = await getRooms()
      }
    })
    socket.on('send_target', function(roomId, target) {
      // socket
      //   .to(roomId)
      //   .emit('sys', `${user} 送出了他給對手的猜測值`, rooms[roomId])
      // console.log(`${user} 送出了他給對手的猜測值： ${target}`)
    })
  })
}
start()
