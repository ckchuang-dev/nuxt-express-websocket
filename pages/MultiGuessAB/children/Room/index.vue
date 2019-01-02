<template>
  <div id="pg_multi_guessing_number">
    <header>
      <div>
        <h1>Multiplayer 1A2B Guessing Number</h1>
        <h2>房間號碼：{{roomId}}</h2>
      </div>
      <div>
        <nuxt-link :to="{name: 'multi_guess_AB'}">
          <Button @click="leaveRoom">回到大廳</Button>
        </nuxt-link>
      </div>
    </header>
    <hr />
    <h2>系統訊息</h2>
    <div class="log">
      <div
        :key="`${msg.time}_${msg.text}`"
        v-for="msg in systemLog"
      >
        <span>{{`${msg.time}: `}}</span>
        <span>{{msg.text}}</span>
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
        roomId: this.$route.params.roomId,
        systemLog: []
      }
    },
    methods: {
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
    }
  }
</script>

<style lang="scss" src="./style.scss" scoped></style>
