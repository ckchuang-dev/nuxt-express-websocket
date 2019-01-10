<template>
  <div
    v-if="user"
    id="pg_multi_guessing_number"
  >
    <header>
      <div class="header_container">
        <!-- <div class="main_title">Multiplayer 1A2B Guessing Number</div> -->
        <div class="roomId">房間號碼：{{roomId}}</div>
        <div class="player">房內玩家：Alice、Bob</div>
        <div
          class="button"
          v-if="isGameOver"
        >
          <button
            @click="restartGame"
            :disabled="isRestartSent"
          >再來一場</button>
        </div>
        <div
          class="button"
          v-if="!isGameStart || isGameOver"
        >
          <nuxt-link :to="{name: 'multi_guess_AB_main'}">
            <button @click="leaveRoom">回到大廳</button>
          </nuxt-link>
        </div>
        <div
          class="button"
          v-if="isTargetSent && isGameStart && !isGameOver"
        >
          <button @click="stopGame">放棄此局</button>
        </div>
      </div>
    </header>

    <div class="container">
      <div
        v-if="!isGameStart"
        class="before_game"
      >
        <div class="title">規則</div>
        <div class="rules">
          <ul>
            <li>對戰前，雙方分別指定一組四位數（0~9 不重複數字組成）給對方猜測。</li>
            <li>對戰時，輪流猜題，送出猜測後系統會給猜題者「XAXB」的提示。</li>
            <li><b>A</b>：有這個數字，且數字是在正確的位置。</li>
            <li><b>B</b>：有這個數字，但位置不對。</li>
            <li>例如題目為 1234，玩家猜 1562，則提示是 1A1B。</li>
            <li>先猜到對方給的數組者獲勝！</li>
          </ul>
        </div>
        <div
          v-if="!isTargetSent"
          class="target_input"
        >
          <div class="title">請輸入給對手的猜測</div>
          <input
            v-model="target"
            type="text"
            placeholder="請輸入數字"
          >
          <button @click="randomGenerate">隨機產生</button>
          <button @click="submitTarget">送出</button>
          <div
            class="error"
            v-if="errorMsg"
          >{{errorMsg}}</div>
        </div>
        <div
          v-else
          class="target_sent"
        >
          <div class="title">你給對手的猜測</div>
          <div class="target">{{target}}</div>
          <div
            class="btn_group"
            v-if="isTargetSent && !isGameStart"
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
        </div>
      </div>

      <div v-else>
        <div
          v-if="isGameStart && !isGameOver"
          class="battle_container"
        >
          <div class="title">對戰內容</div>
          <div class="user_input">
            <div v-if="isYourTurn">
              <input
                type="text"
                v-model="userInput"
                @keyup.enter="submitGuessing"
                placeholder="輸入你的猜測"
              >
              <button @click="submitGuessing">送出</button>
              <div
                class="error"
                v-if="errorMsg"
              >{{errorMsg}}</div>
            </div>
            <div v-else>
              <div>現在輪到對手猜測囉！</div>
            </div>
          </div>
        </div>
        <div
          v-else-if="isGameOver"
          class="hit"
        >
          <div v-if="isWinner">
            <div class="congratulation">恭喜你猜對了！</div>
            <img
              src="~/assets/images/good.jpg"
              alt=""
            >
          </div>
          <div v-else>
            <div class="congratulation">不哭不哭，眼淚是珍珠！</div>
            <img
              src="~/assets/images/loser.png"
              alt=""
            >
          </div>
        </div>
        <div class="guessing">
          <div class="your_guessing">
            <div v-if="isGameOver">
              <div class="title">對手給你的猜測數組</div>
              <div class="target">
                {{guessingTarget}}
              </div>
            </div>
            <div class="title">你的猜測紀錄</div>
            <div class="list">
              <div
                :key="index"
                v-for="(item, index) in yourGuessings"
              >
                {{`你猜了「${item.guess}」，結果為「${item.result}」`}}
              </div>
            </div>
          </div>
          <div class="other_guessing">
            <div class="title">你給對手的猜測數組</div>
            <div class="target">
              {{target}}
            </div>
            <div class="title">對手猜測紀錄</div>
            <div class="list">
              <div
                :key="index"
                v-for="(item, index) in otherGuessings"
              >
                {{`對手猜了「${item.guess}」，結果為「${item.result}」`}}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="system_log">
        <div class="msg_container">
          <div
            class="msg"
            :key="`${msg.time}_${msg.text}`"
            v-for="msg in systemLog"
          >
            <span>{{`${msg.time}: `}}</span>
            <span>{{msg.text}}</span>
          </div>
          <div
            id="msg_end"
            ref="msg_end"
          >&nbsp;</div>
        </div>
        <div id="msg_input">
          <input
            type="text"
            v-model="chatMessage"
            placeholder="輸入聊天訊息"
            @keyup.enter="sendChatMessage"
          >
          <button @click="sendChatMessage">送出</button>
        </div>
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
        chatMessage: '',
        errorMsg: '',
        // battle data
        isGameStart: false,
        isYourTurn: false,
        userInput: '',
        isGameOver: false,
        winner: '',
        guessingTarget: '',
        yourGuessings: [],
        otherGuessings: []
      }
    },
    computed: {
      isWinner() {
        if (this.user && this.user.nickname) {
          return this.winner === this.user.nickname
        }
        return false
      },
      answerRegex() {
        return new RegExp('^(?!.*(.).*\\1)\\d{4}$')
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
          if (this.answerRegex.test(this.target)) {
            this.isTargetSent = true
            this.$socket.emit('SEND_TARGET', this.target)
            this.errorMsg = ''
          } else {
            this.errorMsg = '數組格式不正確'
          }
        } else {
          this.errorMsg = '數組不能為空'
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
        if (this.userInput) {
          if (this.answerRegex.test(this.userInput)) {
            this.$socket.emit('SEND_GUESSING', this.userInput, this.isRoomManager)
            this.errorMsg = ''
          } else {
            this.errorMsg = '猜測格式不正確'
          }
        } else {
          this.errorMsg = '猜測不能為空'
        }
      },
      sendChatMessage() {
        if (this.chatMessage) {
          this.$socket.emit(
            'SEND_CHAT_MESSAGE',
            this.chatMessage,
            this.user.nickname
          )
          this.chatMessage = ''
        }
      }
    },
    mounted() {
      this.$socket.on('SYSTEM_LOG', data => {
        this.systemLog.push({
          time: moment(new Date().toJSON()).format('LTS'),
          text: data
        })
        if (this.$refs.msg_end) {
          this.$refs.msg_end.scrollIntoView()
        }
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
      this.$socket.on('SEND_GUESSING_TARGET', () => {
        if (this.isRoomManager) {
          this.isYourTurn = true
        }
        this.isGameStart = true
      })
      this.$socket.on('CHANGE_TURN', () => {
        this.isYourTurn = true
      })
      this.$socket.on('GUESSING_LIST', data => {
        if (this.isYourTurn) {
          this.yourGuessings.push(data)
          this.isYourTurn = false
          this.userInput = ''
        } else {
          this.otherGuessings.push(data)
        }
      })
      this.$socket.on('GAME_OVER', (winner, guessingTarget) => {
        this.guessingTarget = guessingTarget
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
        this.isGameOver = false
        this.winner = ''
        this.isRoomManager = false
        this.yourGuessings = []
        this.otherGuessings = []
        this.guessingTarget = ''
      })
    }
  }
</script>

<style lang="scss" src="./style.scss" scoped></style>
