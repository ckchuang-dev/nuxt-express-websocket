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
    <h3>房間列表</h3>
    <div class="room_list">
      <div
        class="room"
        :key="room.id"
        v-for="room in roomList"
      >
        <button
          @click="joinRoom(room.id)"
          :disabled="checkRoomStatus(room.id)"
        >{{`Room ${room.id}`}}</button>
        <div v-if="room.player1">{{`P1: ${room.player1.nickname}`}}</div>
        <div v-if="room.player2">{{`P2: ${room.player2.nickname}`}}</div>
      </div>
    </div>
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
        roomList: []
      }
    },
    methods: {
      joinRoom(roomId) {
        this.$socket.emit('JOIN_ROOM', roomId)
      },
      checkRoomStatus(roomId) {
        const i = roomId - 1
        return (
          this.roomList &&
          this.roomList[i] &&
          this.roomList[i].player1 &&
          this.roomList[i].player2
        )
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
      this.$socket.on('UPDATE_ROOM_DATA', data => {
        this.roomList = data
      })
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
