<template>
  <div id="pg_multi_main_guessing_number">
    <header>
      <h1>遊戲大廳</h1>
      <button @click="logoutUser">登出</button>
      <div v-if="user && user.nickname">
        <span>Hi, {{user.nickname}}！</span>
      </div>

    </header>
    <hr>
    <h3>房間列表</h3>
    <nuxt-link :to="{name: 'multi_guess_AB_room',params:{roomId: '1'}}">
      <button @click="joinRoom('1')">Room 1</button>
    </nuxt-link>
    <nuxt-link :to="{name: 'multi_guess_AB_room',params:{roomId: '2'}}">
      <button @click="joinRoom('2')">Room 2</button>
    </nuxt-link>
    <nuxt-link :to="{name: 'multi_guess_AB_room',params:{roomId: '3'}}">
      <button @click="joinRoom('3')">Room 3</button>
    </nuxt-link>
    <hr>
    <h3>在線玩家列表</h3>
    <div
      :key="item.socketId"
      v-for="item in userList"
    >
      <div>{{item.nickname}}</div>
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
        userList: []
      }
    },
    methods: {
      joinRoom(roomId) {
        this.$socket.emit('join', roomId)
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
    }
  }
</script>

<style lang="scss" src="./style.scss" scoped></style>
