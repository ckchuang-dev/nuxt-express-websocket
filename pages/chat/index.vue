<template>
  <div>
    <div class="message">
      <div class="input_message">
        <p>訊息：</p>
        <input
          v-model="message"
          type="text"
          placeholder="Type here"
          autocomplete="off"
        />
      </div>

      <button @click="sendMessage">送出</button>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        message: '',
        messages: []
      }
    },
    methods: {
      sendMessage() {
        console.log(this.message)
        if (!this.message.trim()) return
        let message = {
          date: new Date().toJSON(),
          text: this.message.trim()
        }
        this.messages.push(message)
        this.message = ''
        this.$socket.emit('send_message', message)
      }
    },
    head: {
      title: 'Nuxt.js with Socket.io'
    }
  }
</script>

<style>
</style>
