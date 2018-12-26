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
            <span>{{` ----> `}}</span>
            <span>第 {{index + 1}} 次結果：{{item.aCount}} A {{item.bCount}} B</span>
          </li>
        </ul>
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
        anwser: '1234',
        userInput: '',
        guessingList: []
      }
    },
    methods: {
      calculateResult() {
        let aCount = 0
        let bCount = 0
        for (let i = 0; i < 4; i++) {
          if (this.anwser[i] === this.userInput[i]) {
            aCount++
          } else if (this.anwser.indexOf(this.userInput[i]) > -1) {
            bCount++
          }
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
      },
      restartGame() {
        this.anwser = '1234'
        this.userInput = ''
        this.guessingList = []
      }
    }
  }
</script>

<style lang="scss" src="./style.scss" scoped></style>
