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
              <i :title="message.date">
                {{ message.date }}
              </i>
              <i
                v-if="message.nickname"
                :title="message.nickname"
              >
                {{`${message.nickname}: `}}
              </i>
              {{ message.text }}
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
        <button @click="sendMessage">送出</button>
      </li>
    </ul>
  </div>
</template>

<script>
  import moment from 'moment'
  export default {
    head: {
      title: 'Nuxt.js with Socket.io'
    },
    data() {
      return {
        message: '',
        messages: [],
        nickname: '',
        nicknameArr: [
          '鳳山下智久',
          '哈爾濱崎步',
          '大坪林俊傑',
          '三芝田信長',
          '新竹林七賢',
          '虎尾田榮一郎',
          '武當山德勒',
          '水沙連勝文',
          '池上戶彩',
          '清水樹奈奈',
          '六張黎智英',
          '二十張無忌'
        ]
      }
    },
    methods: {
      sendMessage() {
        if (!this.message.trim()) return
        let message = {
          text: this.message,
          nickname: this.nickname,
          date: moment(new Date().toJSON()).format('LTS')
        }
        this.messages.push(message)
        this.$socket.emit('chat_message', message)
        this.message = ''
      }
    },

    beforeMount() {
      const nickname = `${this.nicknameArr[Math.floor(12 * Math.random())]}`
      this.nickname = nickname
      this.$socket.emit('join', {
        username: nickname
      })
    },
    mounted() {
      // 監聽連線訊息
      this.$socket.on('broadcast_join', data => {
        // $('#user_count').text(`在線人數：${data.userCount} 人`)
        this.messages.push({
          text: `${data.username} 前來報到！`,
          nickname: '',
          date: moment(new Date().toJSON()).format('LTS')
        })
        window.scrollTo(0, document.body.scrollHeight)
      })

      // 監聽離線訊息
      this.$socket.on('broadcast_quit', data => {
        // $('#user_count').text(`在線人數：${data.userCount} 人`)
        this.messages.push({
          text: `${data.username} 已隨風飄逝！`,
          nickname: '',
          date: moment(new Date().toJSON()).format('LTS')
        })
        window.scrollTo(0, document.body.scrollHeight)
      })

      // 監聽聊天訊息
      this.$socket.on('chat_message', msg => {
        this.messages.push(msg)
        window.scrollTo(0, document.body.scrollHeight)
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
