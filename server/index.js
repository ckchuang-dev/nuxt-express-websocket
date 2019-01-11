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
    let roomIndex = -1
    let users = await getUsers()
    const socketId = socket.id
    // console.log(`${socketId} connected!`)

    socket.on('GET_USER_LIST', async () => {
      users = await getUsers()
      io.to(socketId).emit('UPDATE_USER_LIST', users)
    })

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
              users = await getUsers()
              socket.broadcast.emit('UPDATE_USER_LIST', users)
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
    socket.on('LOGOUT_USER', async function() {
      if (user) {
        user.isOnline = false
        user.socketId = ''
        updateUser(user)
        users = await getUsers()
        socket.broadcast.emit('UPDATE_USER_LIST', users)
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
        users = await getUsers()
        socket.broadcast.emit('UPDATE_USER_LIST', users)
      }
    })

    // 遊戲大廳
    socket.on('JOIN_ROOM', async function(roomId) {
      rooms = await getRooms()
      roomIndex = roomId - 1
      if (rooms && rooms[roomIndex]) {
        if (rooms[roomIndex].player1 && rooms[roomIndex].player2) {
          io.to(socketId).emit('JOIN_ROOM_FAIL', '房間已滿！')
        } else {
          if (!rooms[roomIndex].player1) {
            let room = {
              ...rooms[roomIndex],
              player1: user
            }
            await updateRoom(room)
          } else if (!rooms[roomIndex].player2) {
            let room = {
              ...rooms[roomIndex],
              player2: user
            }
            await updateRoom(room)
          }
          socket.join(roomId)
          user.roomId = roomId
          await updateUser(user)
          io.to(socketId).emit('JOIN_ROOM_SUCCESS', roomId)
          if (user && user.nickname) {
            io.in(user.roomId).emit(
              'SYSTEM_LOG',
              `[系統] ${user.nickname} 加入了房間`,
              rooms[user.roomId]
            )
          }
          rooms = await getRooms()
        }
      }
    })

    async function updatePlayerList() {
      rooms = await getRooms()
      const players = []
      if (rooms && rooms[roomIndex] && rooms[roomIndex].player1) {
        players.push(rooms[roomIndex].player1.nickname)
      }
      if (rooms && rooms[roomIndex] && rooms[roomIndex].player2) {
        players.push(rooms[roomIndex].player2.nickname)
      }
      io.in(user.roomId).emit('PLAYER_LIST', players, rooms[user.roomId])
    }

    socket.on('CLIENT_JOIN_ROOM_SUCCESS', async () => {
      updatePlayerList()
    })

    async function leaveRoom(roomId) {
      rooms = await getRooms()
      if (rooms && rooms[roomIndex]) {
        if (
          rooms[roomIndex].player1 &&
          rooms[roomIndex].player1.socketId &&
          rooms[roomIndex].player1.socketId === socketId
        ) {
          let room = {
            ...rooms[roomIndex],
            player1: null
          }
          await updateRoom(room)
          io.in(user.roomId).emit('RESET_GAME')
          resetGameData()
        } else if (
          rooms[roomIndex].player2 &&
          rooms[roomIndex].player2.socketId &&
          rooms[roomIndex].player2.socketId === socketId
        ) {
          let room = {
            ...rooms[roomIndex],
            player2: null
          }
          await updateRoom(room)
          io.in(user.roomId).emit('RESET_GAME')
          resetGameData()
        }
        await updatePlayerList()
        socket.leave(roomId)
        delete user.roomId
        await updateUser(user)

        if (user && user.nickname) {
          socket
            .to(roomId)
            .emit(
              'SYSTEM_LOG',
              `[系統] ${user.nickname} 退出了房間`,
              rooms[roomId]
            )
          // console.log(`${user.nickname} 退出了 ${roomId}`)
        }
        rooms = await getRooms()
        roomIndex = -1
      }
    }

    // 遊戲房內
    socket.on('LEAVE_ROOM', function(roomId) {
      leaveRoom(roomId)
    })
    socket.on('SEND_TARGET', async function(target) {
      rooms = await getRooms()
      if (user && user.roomId && user.nickname && rooms && rooms[roomIndex]) {
        if (
          rooms[roomIndex].player1 &&
          socketId === rooms[roomIndex].player1.socketId
        ) {
          let room = {
            ...rooms[roomIndex],
            player1: {
              ...rooms[roomIndex].player1,
              target: target
            }
          }
          await updateRoom(room)
        } else if (
          rooms[roomIndex].player2 &&
          socketId === rooms[roomIndex].player2.socketId
        ) {
          let room = {
            ...rooms[roomIndex],
            player2: {
              ...rooms[roomIndex].player2,
              target: target
            }
          }
          await updateRoom(room)
        }
        io.in(user.roomId).emit(
          'SYSTEM_LOG',
          `[系統] ${user.nickname} 送出了給對手的猜測值！`,
          rooms[user.roomId]
        )
        // console.log(`${user.nickname} 送出了他給對手的猜測值： ${target}`)
      }
    })
    socket.on('SEND_READY_STATUS', async function(ready) {
      rooms = await getRooms()
      if (user && user.roomId && user.nickname && rooms && rooms[roomIndex]) {
        if (
          rooms[roomIndex].player1 &&
          socketId === rooms[roomIndex].player1.socketId
        ) {
          let room = {
            ...rooms[roomIndex],
            player1: {
              ...rooms[roomIndex].player1,
              ready: ready
            }
          }
          await updateRoom(room)
        } else if (
          rooms[roomIndex].player2 &&
          socketId === rooms[roomIndex].player2.socketId
        ) {
          let room = {
            ...rooms[roomIndex],
            player2: {
              ...rooms[roomIndex].player2,
              ready: ready
            }
          }
          await updateRoom(room)
        }
        if (ready) {
          io.in(user.roomId).emit(
            'SYSTEM_LOG',
            `[系統] ${user.nickname} 已準備就緒！`,
            rooms[user.roomId]
          )
        } else {
          io.in(user.roomId).emit(
            'SYSTEM_LOG',
            `[系統] 等...等等一下，${user.nickname} 已取消準備！`,
            rooms[user.roomId]
          )
        }
        rooms = await getRooms()
        if (rooms && rooms[roomIndex] && rooms[roomIndex].player1) {
          if (
            rooms[roomIndex].player1.ready &&
            rooms[roomIndex].player2 &&
            rooms[roomIndex].player2.ready
          ) {
            io.to(rooms[roomIndex].player1.socketId).emit(
              'IS_ROOM_MANAGER',
              true
            )
          } else {
            io.to(rooms[roomIndex].player1.socketId).emit(
              'IS_ROOM_MANAGER',
              false
            )
          }
        }
      }
    })

    // 對戰開始
    socket.on('START_GAME', async function() {
      rooms = await getRooms()
      io.in(user.roomId).emit(
        'SYSTEM_LOG',
        `[系統] 對戰開始！`,
        rooms[user.roomId]
      )
      io.to(rooms[roomIndex].player1.socketId).emit('SEND_GUESSING_TARGET')
      io.to(rooms[roomIndex].player2.socketId).emit('SEND_GUESSING_TARGET')
    })

    function calculateResult(answer, userInput) {
      let aCount = 0
      let bCount = 0
      for (let i = 0; i < 4; i++) {
        if (answer[i] === userInput[i]) {
          aCount++
        } else if (answer.indexOf(userInput[i]) > -1) {
          bCount++
        }
      }
      return {
        aCount: aCount,
        bCount: bCount,
        win: aCount === 4
      }
    }

    async function resetGameData() {
      rooms = await getRooms()
      let room = {
        ...rooms[roomIndex]
      }
      if (room && room.player1) {
        delete room.player1.target
        delete room.player1.ready
        delete room.player1.restart
      }
      if (room && room.player2) {
        delete room.player2.target
        delete room.player2.ready
        delete room.player2.restart
      }
      await updateRoom(room)
      rooms = await getRooms()
    }

    socket.on('SEND_GUESSING', async function(guessing, isPlayer1) {
      rooms = await getRooms()
      if (isPlayer1) {
        const result = calculateResult(
          rooms[roomIndex].player2.target,
          guessing
        )
        if (result.win) {
          io.in(user.roomId).emit(
            'SYSTEM_LOG',
            `[系統] 恭喜 ${rooms[roomIndex].player1.nickname} 猜到了！`,
            rooms[user.roomId]
          )
          io.in(user.roomId).emit(
            'GUESSING_LIST',
            { guess: guessing, result: `${result.aCount}A${result.bCount}B` },
            rooms[user.roomId]
          )
          const winner = rooms[roomIndex].player1.nickname
          io.to(rooms[roomIndex].player1.socketId).emit(
            'GAME_OVER',
            winner,
            rooms[roomIndex].player2.target
          )
          io.to(rooms[roomIndex].player2.socketId).emit(
            'GAME_OVER',
            winner,
            rooms[roomIndex].player1.target
          )
        } else {
          io.in(user.roomId).emit(
            'GUESSING_LIST',
            { guess: guessing, result: `${result.aCount}A${result.bCount}B` },
            rooms[user.roomId]
          )
          io.to(rooms[roomIndex].player2.socketId).emit('CHANGE_TURN')
        }
      } else {
        const result = calculateResult(
          rooms[roomIndex].player1.target,
          guessing
        )
        if (result.win) {
          io.in(user.roomId).emit(
            'SYSTEM_LOG',
            `[系統] 恭喜 ${rooms[roomIndex].player2.nickname} 猜到了！`,
            rooms[user.roomId]
          )
          io.in(user.roomId).emit(
            'GUESSING_LIST',
            { guess: guessing, result: `${result.aCount}A${result.bCount}B` },
            rooms[user.roomId]
          )
          const winner = rooms[roomIndex].player1.nickname
          io.to(rooms[roomIndex].player1.socketId).emit(
            'GAME_OVER',
            winner,
            rooms[roomIndex].player2.target
          )
          io.to(rooms[roomIndex].player2.socketId).emit(
            'GAME_OVER',
            winner,
            rooms[roomIndex].player1.target
          )
        } else {
          io.in(user.roomId).emit(
            'GUESSING_LIST',
            { guess: guessing, result: `${result.aCount}A${result.bCount}B` },
            rooms[user.roomId]
          )
          io.to(rooms[roomIndex].player1.socketId).emit('CHANGE_TURN')
        }
      }
    })

    socket.on('STOP_GAME', function(nickname) {
      io.in(user.roomId).emit(
        'SYSTEM_LOG',
        `[系統] ${nickname} 已放棄此局對戰！`,
        rooms[user.roomId]
      )
      io.in(user.roomId).emit('RESET_GAME')
      resetGameData()
    })

    socket.on('RESTART_GAME', async function(nickname) {
      rooms = await getRooms()
      io.in(user.roomId).emit(
        'SYSTEM_LOG',
        `[系統] ${nickname} 想要再來一場對戰。`,
        rooms[user.roomId]
      )
      if (user && user.roomId && user.nickname && rooms && rooms[roomIndex]) {
        if (
          rooms[roomIndex].player1 &&
          socketId === rooms[roomIndex].player1.socketId
        ) {
          let room = {
            ...rooms[roomIndex],
            player1: {
              ...rooms[roomIndex].player1,
              restart: true
            }
          }
          await updateRoom(room)
        } else if (
          rooms[roomIndex].player2 &&
          socketId === rooms[roomIndex].player2.socketId
        ) {
          let room = {
            ...rooms[roomIndex],
            player2: {
              ...rooms[roomIndex].player2,
              restart: true
            }
          }
          await updateRoom(room)
        }
        rooms = await getRooms()
      }
      if (
        rooms[roomIndex].player1.restart &&
        rooms[roomIndex].player2.restart
      ) {
        io.in(user.roomId).emit('RESET_GAME')
        resetGameData()
        io.in(user.roomId).emit(
          'SYSTEM_LOG',
          `[系統] 雙方已準備好開始一場新對戰！`,
          rooms[user.roomId]
        )
      }
    })

    socket.on('SEND_CHAT_MESSAGE', async (msg, nickname) => {
      rooms = await getRooms()
      io.in(user.roomId).emit(
        'SYSTEM_LOG',
        `[聊天] ${nickname}： ${msg}`,
        rooms[user.roomId]
      )
    })
  })
}
start()
