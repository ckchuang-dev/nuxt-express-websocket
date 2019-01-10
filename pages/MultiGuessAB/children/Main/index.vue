<template>
  <div
    v-if="user"
    id="pg_multi_main_guessing_number"
  >
    <header>
      <h1>遊戲大廳</h1>
      <button @click="logoutUser">登出</button>
      <div v-if="user && user.nickname">
        <span>Hi, {{user.nickname}}！</span>
      </div>

    </header>
    <hr>
    <h3>房間列表</h3>
    <button @click="joinRoom('1')">Room 1</button>
    <button @click="joinRoom('2')">Room 2</button>
    <button @click="joinRoom('3')">Room 3</button>
    <button @click="joinRoom('4')">Room 4</button>
    <button @click="joinRoom('5')">Room 5</button>
    <button @click="joinRoom('6')">Room 6</button>
    <button @click="joinRoom('7')">Room 7</button>
    <!-- <hr>
    <h3>在線玩家列表</h3>
    <div
      :key="item.socketId"
      v-for="item in userList"
    >
      <div>{{item.nickname}}</div>
    </div> -->
  </div>
</template>

<script>
  export default {
    name: 'Main',
    head: {
      title: '1A2B Guessing Number'
    },
    data() {
      return {
        user: null,
        userList: []
      }
    },
    methods: {
      joinRoom(roomId) {
        this.$socket.emit('JOIN_ROOM', roomId)
      },
      logoutUser() {
        this.$socket.emit('LOGOUT_USER')
        this.$router.replace({
          name: 'multi_guess_AB_login'
        })
      }
    },
    mounted() {
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
      this.$socket.on('JOIN_ROOM_SUCCESS', roomId => {
        this.$router.replace({
          name: 'multi_guess_AB_room',
          params: {
            roomId: roomId
          }
        })
      })
      this.$socket.on('JOIN_ROOM_FAIL', msg => {
        alert(msg)
      })
    }
  }
</script>

<style lang="scss" src="./style.scss" scoped></style>
