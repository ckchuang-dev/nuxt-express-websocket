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
        <nuxt-link :to="{name: 'multi_guess_AB'}">
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
        <button>準備就緒</button>
      </div>
    </div>

    <!-- <div>
      <div>
        <button
          v-if="!isGameStart && !hit"
          @click="startGame"
        >開始遊戲</button>
        <button
          v-else-if="hit"
          @click="restartGame"
        >再來一場</button>
        <button
          v-else
          @click="stopGame"
        >現在放棄，比賽就結束了</button>
      </div>
    </div>
    <div class="container">
      <div
        class="guessing"
        v-if="isGameStart"
      >
        <div class="duration">
          <span>經過時間：</span>
          <span>{{` ${duration} 秒`}}</span>
        </div>
        <div class="user_input">
          <span>輸入你的猜測：</span>
          <input
            type="text"
            v-model="userInput"
            @keyup.enter="submitGuessing"
          >
          <button @click="submitGuessing">送出</button>
        </div>
        <div class="guessing_list">
          <ul>
            <li
              v-for="(item, index) in guessingList"
              :key="index"
            >
              <span>{{`第 ${item.timeStamp} 秒`}}</span>
              <span>{{`／`}}</span>
              <span>第 {{index + 1}} 次猜測：{{item.guess}}</span>
              <span>{{`／`}}</span>
              <span>第 {{index + 1}} 次結果：{{item.aCount}} A {{item.bCount}} B</span>
            </li>
          </ul>
        </div>
      </div>
      <div
        v-if="hit"
        class="hit"
      >
        <div class="congradulation">恭喜你猜對了！</div>
        <div class="result">
          <h2>結果統計</h2>
          <div>{{`答案：${answer}`}}</div>
          <div>{{`猜測次數：${guessingList.length}`}}</div>
          <div v-if="guessingList.length && guessingList[guessingList.length-1]">{{`花費時間：${guessingList[guessingList.length-1].timeStamp}`}}</div>
        </div>
        <img
          src="~/assets/images/good.jpg"
          alt=""
        >
      </div>
    </div> -->
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
        this.$socket.emit('send_target', this.roomId, this.target)
      },
      leaveRoom() {
        this.$socket.emit('leave', this.roomId)
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
    }
  }
</script>

<style lang="scss" src="./style.scss" scoped></style>
