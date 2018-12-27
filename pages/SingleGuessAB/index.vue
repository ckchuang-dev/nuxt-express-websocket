<template>
  <div id="pg_single_guessing_number">
    <header>
      <div>
        <h1>1A2B Guessing Number</h1>
      </div>
      <div>
        <Button
          v-if="!isGameStart && !hit"
          @click="startGame"
        >開始遊戲</Button>
        <Button
          v-else-if="hit"
          @click="restartGame"
        >再來一場</Button>
        <Button
          v-else
          @click="stopGame"
        >現在放棄，比賽就結束了</Button>
      </div>
    </header>
    <hr />
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
    </div>
  </div>
</template>

<script>
  export default {
    head: {
      title: '1A2B Guessing Number'
    },
    data() {
      return {
        answer: this.generateAnswer(),
        userInput: '',
        guessingList: [],
        hit: false,
        startTime: new Date(),
        isGameStart: false,
        duration: 0,
        interval: null
      }
    },
    methods: {
      calculateResult() {
        let aCount = 0
        let bCount = 0
        for (let i = 0; i < 4; i++) {
          if (this.answer[i] === this.userInput[i]) {
            aCount++
          } else if (this.answer.indexOf(this.userInput[i]) > -1) {
            bCount++
          }
        }
        if (aCount === 4) {
          this.hit = true
          this.isGameStart = false
        }
        return {
          aCount: aCount,
          bCount: bCount
        }
      },
      submitGuessing() {
        const result = this.calculateResult()
        const guessing = {
          guess: this.userInput,
          aCount: result.aCount,
          bCount: result.bCount,
          timeStamp: this.duration
        }
        this.guessingList.push(guessing)
        this.userInput = ''
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
      timeCount() {
        const now = new Date()
        this.duration = Math.round((now - this.startTime) / 1000)
      },
      startGame() {
        this.startTime = new Date()
        this.isGameStart = true
        this.interval = setInterval(() => {
          this.timeCount()
        }, 1000)
      },
      restartGame() {
        this.stopGame()
        this.startGame()
      },
      stopGame() {
        clearInterval(this.interval)
        this.isGameStart = false
        this.answer = this.generateAnswer()
        this.userInput = ''
        this.guessingList = []
        this.hit = false
        this.startTime = new Date()
        this.duration = 0
      }
    }
  }
</script>

<style lang="scss" src="./style.scss" scoped></style>
