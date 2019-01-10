<template>
  <div>
    <header>
      <h1>Tic Tac Toe</h1>
      <div class="guide">
        <div class="turn">
          <span>Turn：</span>
          <span v-if="turn === 1">輪到 O 選手</span>
          <span v-else-if="turn === -1">輪到 X 選手</span>
          <span v-else-if="turn === 0">比賽結束</span>
        </div>
        <div class="winner">
          <span>Winner：</span>
          <span v-if="winner === 1">畫 O 者獲勝！</span>
          <span v-else-if="winner === -1">畫 X 者獲勝！</span>
          <span v-else-if="winner === 0">尚未分出勝負</span>
          <span v-else-if="winner === 2">平手！</span>
        </div>
      </div>
      <Button @click="restartGame">Restart</Button>
    </header>
    <hr />
    <div class="container">
      <div class="main">
        <div
          :key="index"
          v-for="(item,index) in gameList"
          class="unit"
          @click="selectUnit(index)"
        >
          <div v-if="item === 1">O</div>
          <div v-else-if="item === -1">X</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    head: {
      title: 'Single Player TicTacToe Game'
    },
    data() {
      return {
        turn: 1,
        gameList: [0, 0, 0, 0, 0, 0, 0, 0, 0], // 1: 圈, 0: 空, -1: 叉
        winner: 0,
        stepCount: 0,
        winCase: [
          [0, 1, 2],
          [3, 4, 5],
          [6, 7, 8],
          [0, 3, 6],
          [1, 4, 7],
          [2, 5, 8],
          [0, 4, 8],
          [2, 4, 6]
        ]
      }
    },
    computed: {},
    methods: {
      checkWinner() {
        for (let i = 0; i < this.winCase.length && this.turn !== 0; i++) {
          const match = this.winCase[i].reduce((accum, curr) => {
            return accum + this.gameList[curr]
          }, 0)
          if (match === 3) {
            this.winner = 1
            this.turn = 0
            return
          } else if (match === -3) {
            this.winner = -1
            this.turn = 0
            return
          }
        }
        if (this.stepCount === 9) {
          this.winner = 2
          this.turn = 0
        }
      },
      selectUnit(i) {
        if (this.gameList[i] === 0 && this.turn !== 0) {
          if (this.turn === 1) {
            this.gameList[i] = 1
            this.stepCount++
            this.checkWinner()
            if (this.winner === 0) {
              this.turn = -1
            }
          } else if (this.turn === -1) {
            this.gameList[i] = -1
            this.stepCount++
            this.checkWinner()
            if (this.winner === 0) {
              this.turn = 1
            }
          } else {
            return false
          }
        }
      },
      restartGame() {
        this.turn = 1
        this.gameList = [0, 0, 0, 0, 0, 0, 0, 0, 0]
        this.winner = 0
        this.stepCount = 0
      }
    }
  }
</script>

<style lang="scss" src="./style.scss" scoped/>
