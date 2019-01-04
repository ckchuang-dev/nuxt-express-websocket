<template>
  <div
    v-if="user"
    id="pg_multi_guessing_number"
  >
    <header>
      <div>
        <h1>Multiplayer 1A2B Guessing Number</h1>
        <h2>房間號碼：{{roomId}}</h2>
      </div>
      <div>
        <nuxt-link :to="{name: 'multi_guess_AB_main'}">
          <button @click="leaveRoom">回到大廳</button>
        </nuxt-link>
      </div>
    </header>

    <hr />

    <div class="log">
      <div class="title">系統訊息</div>
      <div class="msg_container">
        <div
          class="msg"
          :key="`${msg.time}_${msg.text}`"
          v-for="msg in systemLog"
        >
          <span>{{`${msg.time}: `}}</span>
          <span>{{msg.text}}</span>
        </div>
      </div>
    </div>

    <hr />

    <div class="game_container">
      <div class="title">遊戲內容</div>
      <div class="before_game">
        <div>請輸入一組四位數字給對方猜測（由 0 ~ 9 不重複數字組成）：</div>
        <input
          v-model="target"
          type="text"
          :disabled="isTargetSent"
        >
        <button
          @click="randomGenerate"
          :disabled="isTargetSent"
        >隨機產生</button>
        <button
          @click="submitTarget"
          :disabled="isTargetSent"
        >送出</button>
      </div>
      <div
        v-if="isTargetSent"
        class="target_sent"
      >
        <button
          v-if="isReady"
          @click="clickReady"
        >取消準備</button>
        <button
          v-else
          @click="clickReady"
        >準備就緒</button>
      </div>
      <button
        v-if="isRoomManager"
        @click="startGame"
      >開始遊戲</button>
    </div>
  </div>
</template>

<script>
  import moment from 'moment'
  export default {
    name: 'Main',
    head: {
      title: '1A2B Guessing Number'
    },
    data() {
      return {
        user: null,
        roomId: this.$route.params.roomId,
        systemLog: [],
        target: '',
        guessingAnswer: '',
        userInput: '',
        guessingList: [],
        hit: false,
        startTime: new Date(),
        isGameStart: false,
        isTargetSent: false,
        isReady: false,
        isRoomManager: false,
        duration: 0,
        interval: null
      }
    },
    methods: {
      randomGenerate() {
        this.target = this.generateAnswer()
      },
      generateAnswer() {
        let pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        let result = ''
        for (let i = 0; i < 4; i++) {
          const len = pool.length
          const pivot = Math.floor(Math.random() * len)
          result += pool[pivot]
          pool.splice(pivot, 1)
        }
        return result
      },
      submitTarget() {
        this.isTargetSent = true
        this.$socket.emit('SEND_TARGET', this.target)
      },
      clickReady() {
        this.isReady = !this.isReady
        this.$socket.emit('SEND_READY_STATUS', this.isReady)
      },
      startGame() {
        console.log('BATTLE!')
      },
      leaveRoom() {
        this.$socket.emit('LEAVE_ROOM', this.roomId)
      }
    },
    mounted() {
      this.$socket.on('sys', data => {
        this.systemLog.push({
          time: moment(new Date().toJSON()).format('LTS'),
          text: data
        })
      })
      this.$socket.emit('LOGIN_SUCCESS')
      this.$socket.on('INIT_USER_DATA', data => {
        this.user = data
      })
      this.$socket.on('LOGIN_FAIL', msg => {
        alert(msg)
        this.$router.replace({
          name: 'multi_guess_AB_login'
        })
      })
      this.$socket.on('IS_ROOM_MANAGER', status => {
        this.isRoomManager = status
      })
    }
  }
</script>

<style lang="scss" src="./style.scss" scoped></style>
