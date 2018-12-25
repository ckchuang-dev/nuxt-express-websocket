const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = require('express')()
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

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  server.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })

  // Socket.io
  var messages = []
  io.on('connection', socket => {
    consola.log('connection')
    socket.on('send_message', function(message) {
      console.log(message)
      // messages.push(message)
      // socket.broadcast.emit('new-message', message)
    })
  })
}
start()
