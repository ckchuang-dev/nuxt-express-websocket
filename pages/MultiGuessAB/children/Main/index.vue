<template>
  <div id="pg_multi_main_guessing_number">
    <header>
      <h1>遊戲大廳</h1>
      <button>創建新房間</button>
      <div v-if="nickname">
        <span>Hi, {{nickname}}！</span>
        <button
          v-if="!showEditNickname"
          @click="editNickname"
        >修改暱稱</button>
        <div v-if="showEditNickname">
          <input
            v-model="nickname"
            type="text"
            @keyup.enter="submitNickname"
          >
          <button @click="submitNickname">確定</button>
          <button @click="cancelEditNickname">取消</button>
        </div>

      </div>

    </header>
    <hr>
    <!-- <button>加入房間</button> -->
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
      :key="user.socketId"
      v-for="user in userList"
    >
      <div>{{user.nickname}}</div>
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
        nickname: '',
        showEditNickname: false,
        userList: []
      }
    },
    methods: {
      joinRoom(roomId) {
        this.$socket.emit('join', this.nickname, roomId)
      },
      editNickname() {
        this.showEditNickname = true
      },
      submitNickname() {
        localStorage.setItem('NICK_NAME', this.nickname)
        this.$socket.emit('edit_nickname', this.nickname)
        this.showEditNickname = false
      },
      cancelEditNickname() {
        this.showEditNickname = false
      }
    },
    mounted() {
      let localNickname = localStorage.getItem('NICK_NAME')
      if (localNickname) {
        this.nickname = localNickname
        this.$socket.emit('edit_nickname', this.nickname)
      } else {
        this.nickname = '訪客'
      }
      this.$socket.on('user_list', data => {
        this.userList = Object.values(data)
      })
    }
  }
</script>

<style lang="scss" src="./style.scss" scoped></style>
