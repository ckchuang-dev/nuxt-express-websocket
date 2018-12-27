<template>
  <div>
    <header>
      <h1>單人猜數字遊戲</h1>
      <Button @click="restartGame">Restart</Button>
    </header>
    <hr />
    <div class="container">
      <div class="user_input">
        <div>輸入</div>
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
            <span>第 {{index + 1}} 次猜測：{{item.guess}}</span>
            <span>{{` --> `}}</span>
            <span>第 {{index + 1}} 次結果：{{item.aCount}} A {{item.bCount}} B</span>
          </li>
        </ul>
      </div>
      <div v-if="hit">
        <h2>恭喜你猜對了！</h2>
      </div>

    </div>
  </div>
</template>

<script>
  export default {
    head: {
      title: '單人猜數字遊戲'
    },
    data() {
      return {
        answer: '1234',
        userInput: '',
        guessingList: [],
        hit: false
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
          bCount: result.bCount
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
      restartGame() {
        this.answer = this.generateAnswer()
        this.userInput = ''
        this.guessingList = []
        this.hit = false
      }
    },
    mounted() {
      this.answer = this.generateAnswer()
    }
  }
</script>

<style lang="scss" src="./style.scss" scoped></style>
