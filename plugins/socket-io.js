import io from 'socket.io-client'
const socket = io()

export default (ctx, inject) => {
  inject('socket', socket)
}
