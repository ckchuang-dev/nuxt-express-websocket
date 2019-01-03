const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const express = require('express')
const router = express.Router()
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 3000

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
  let roomInfo = {}
  let connectionList = {}

  io.on('connection', function(socket) {
    console.log('connect')
    let user = ''

    const socketId = socket.id
    const userData = {
      socketId: socketId,
      nickname: '訪客'
    }
    connectionList[socketId] = userData
    io.emit('user_list', connectionList)

    // 遊戲大廳
    socket.on('join', function(userName, roomId) {
      user = userName
      if (!roomInfo[roomId]) {
        roomInfo[roomId] = []
      }
      roomInfo[roomId].push(user)
      socket.join(roomId)
      socket.to(roomId).emit('sys', `${user} 加入了房間`, roomInfo[roomId])
      console.log(`${user} 加入了 ${roomId}`)
      console.log(JSON.stringify(roomInfo))
    })
    socket.on('edit_nickname', function(nickname) {
      connectionList[socketId].nickname = nickname
      io.emit('user_list', connectionList)
    })
    // TODO: 使用者關閉視窗時，若是在房間內，需清空 server 端關於此使用者的房間資料
    socket.on('disconnect', function() {
      delete connectionList[socketId]
      io.emit('user_list', connectionList)
    })

    // 遊戲房內
    socket.on('leave', function(roomId) {
      let index = -1
      if (roomInfo && roomInfo[roomId]) {
        index = roomInfo[roomId].indexOf(user)
      }
      if (index !== -1) {
        roomInfo[roomId].splice(index, 1)
      }
      socket.leave(roomId)
      socket.to(roomId).emit('sys', `${user} 退出了房間`, roomInfo[roomId])
      console.log(`${user} 退出了 ${roomId}`)
    })
    socket.on('send_target', function(roomId, target) {
      socket
        .to(roomId)
        .emit('sys', `${user} 送出了他給對手的猜測值`, roomInfo[roomId])
      console.log(`${user} 送出了他給對手的猜測值： ${target}`)
    })
  })
}
start()
