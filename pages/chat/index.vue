<template>
  <div>
    <ul class="pages">
      <li class="chat page">
        <div class="chatArea">
          <ul
            class="messages"
            ref="messages"
          >
            <li
              class="message"
              v-for="(message, index) in messages"
              :key="index"
            >
              <i :title="message.date">{{ message.date.split('T')[1].slice(0, -2) }}</i>: {{ message.text }}
            </li>
          </ul>
        </div>
        <input
          class="inputMessage"
          type="text"
          v-model="message"
          @keyup.enter="sendMessage"
          placeholder="Type here..."
        />
      </li>
    </ul>
  </div>
  <!-- <div>
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
  </div> -->
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
    },
    beforeMount() {
      this.$socket.on('new_message', message => {
        this.messages.push(message)
      })
    }
  }
</script>

<style>
  * {
    box-sizing: border-box;
  }

  html {
    font-weight: 300;
    -webkit-font-smoothing: antialiased;
  }

  html,
  input {
    font-family: 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue',
      Helvetica, Arial, 'Lucida Grande', sans-serif;
  }

  html,
  body {
    height: 100%;
    margin: 0;
    padding: 0;
  }

  ul {
    list-style: none;
    word-wrap: break-word;
  }

  /* Pages */

  .pages {
    height: 100%;
    margin: 0;
    padding: 0;
    width: 100%;
  }

  .page {
    height: 100%;
    position: absolute;
    width: 100%;
  }

  /* Font */

  .messages {
    font-size: 150%;
  }

  .inputMessage {
    font-size: 100%;
  }

  .log {
    color: gray;
    font-size: 70%;
    margin: 5px;
    text-align: center;
  }

  /* Messages */

  .chatArea {
    height: 100%;
    padding-bottom: 60px;
  }

  .messages {
    height: 100%;
    margin: 0;
    overflow-y: scroll;
    padding: 10px 20px 10px 20px;
  }

  /* Input */

  .inputMessage {
    border: 10px solid #3b8070;
    bottom: 0;
    height: 60px;
    left: 0;
    outline: none;
    padding-left: 10px;
    position: absolute;
    right: 0;
    width: 100%;
  }
</style>
