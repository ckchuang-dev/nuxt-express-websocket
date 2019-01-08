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
      <div v-if="!isGameStart || isGameOver">
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
        <div class="intro">請隨機產生一組數字給對方猜測（由 0 ~ 9 不重複數字組成）：</div>
        <div class="target">{{target}}</div>
        <button
          @click="randomGenerate"
          v-if="!isTargetSent"
        >隨機產生</button>
        <button
          @click="submitTarget"
          v-if="!isTargetSent"
        >送出</button>
      </div>
      <div
        v-if="isTargetSent && !isGameStart"
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
        <button
          v-if="isRoomManager"
          @click="startGame"
        >開始遊戲</button>
      </div>
      <button
        v-else-if="isTargetSent && isGameStart && !isGameOver"
        @click="stopGame"
      >放棄此局</button>
      <button
        v-else-if="isGameOver"
        @click="restartGame"
        :disabled="isRestartSent"
      >再來一場</button>
    </div>

    <hr />

    <div
      v-if="isGameStart && !isGameOver"
      class="battle_container"
    >
      <div class="title">對戰內容</div>
      <div class="battle_content">
        <div class="guessing">
          <div
            class="user_input"
            v-if="isYourTurn"
          >
            <span>輸入你的猜測：</span>
            <input
              type="text"
              v-model="userInput"
              @keyup.enter="submitGuessing"
            >
            <button @click="submitGuessing">送出</button>
          </div>
          <div v-else>
            <div class="instuction">現在輪到對手猜測囉！</div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="isGameOver"
      class="hit"
    >
      <div v-if="isWinner">
        <div class="congradulation">恭喜你猜對了！</div>
        <img
          src="~/assets/images/good.jpg"
          alt=""
        >
      </div>
      <div v-else>
        <div class="congradulation">不哭不哭，眼淚是珍珠！</div>
        <img
          src="~/assets/images/loser.png"
          alt=""
        >
      </div>

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
        // room data
        user: null,
        roomId: this.$route.params.roomId,
        systemLog: [],
        target: '',
        isTargetSent: false,
        isReady: false,
        isRestartSent: false,
        isRoomManager: false,
        // battle data
        isGameStart: false,
        isYourTurn: false,
        userInput: '',
        guessingTarget: '',
        isGameOver: false,
        winner: ''
      }
    },
    computed: {
      isWinner() {
        if (this.user && this.user.nickname) {
          return this.winner === this.user.nickname
        }
        return false
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
        if (this.target) {
          this.isTargetSent = true
          this.$socket.emit('SEND_TARGET', this.target)
        }
      },
      clickReady() {
        this.isReady = !this.isReady
        this.$socket.emit('SEND_READY_STATUS', this.isReady)
      },
      startGame() {
        this.$socket.emit('START_GAME')
      },
      stopGame() {
        const res = confirm('現在放棄，比賽就結束了，你確定嗎？')
        if (res) {
          this.$socket.emit('STOP_GAME', this.user.nickname)
        }
      },
      restartGame() {
        this.$socket.emit('RESTART_GAME', this.user.nickname)
        this.isRestartSent = true
      },
      leaveRoom() {
        this.$socket.emit('LEAVE_ROOM', this.roomId)
      },
      submitGuessing() {
        this.$socket.emit('SEND_GUESSING', this.userInput, this.isRoomManager)
        this.isYourTurn = false
        this.userInput = ''
      }
    },
    mounted() {
      this.$socket.on('SYSTEM_LOG', data => {
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
      this.$socket.on('SEND_GUESSING_TARGET', guessingTarget => {
        if (this.isRoomManager) {
          this.isYourTurn = true
        }
        this.isGameStart = true
        this.guessingTarget = guessingTarget
      })
      this.$socket.on('CHANGE_TURN', () => {
        this.isYourTurn = true
      })
      this.$socket.on('GAME_OVER', winner => {
        this.isYourTurn = false
        this.isGameOver = true
        this.winner = winner
      })
      this.$socket.on('RESET_GAME', () => {
        this.target = ''
        this.isTargetSent = false
        this.isReady = false
        this.isRestartSent = false
        this.isGameStart = false
        this.isYourTurn = false
        this.userInput = ''
        this.guessingTarget = ''
        this.isGameOver = false
        this.winner = ''
      })
    }
  }
</script>

<style lang="scss" src="./style.scss" scoped></style>
