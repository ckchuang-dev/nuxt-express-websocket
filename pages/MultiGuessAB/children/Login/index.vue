<template>
  <div id="pg_multi_guessing_number_login">
    <h1>登入</h1>
    <div>
      <div>帳號：</div>
      <input
        v-model="user.account"
        type="text"
      >
    </div>
    <div>
      <div>密碼：</div>
      <input
        v-model="user.password"
        type="password"
        @keyup.enter="submitLoginData"
      >
    </div>
    <button @click="submitLoginData">送出</button>
    <div class="user_list">
      <div class="instruction">以下為尚可以使用的假帳號，帳號密碼皆為 id。</div>
      <div
        :key="user.id"
        v-for="user in userList"
      >
        <div v-if="!user.isOnline">{{user.id}}<br></div>
      </div>
    </div>

  </div>
</template>

<script>
  export default {
    name: 'Login',
    head: {
      title: '1A2B Guessing Number'
    },
    data() {
      return {
        user: {
          account: '',
          password: ''
        },
        userList: []
      }
    },
    methods: {
      submitLoginData() {
        this.$socket.emit('LOGIN_USER', this.user)
      }
    },
    mounted() {
      this.$socket.emit('GET_USER_LIST')
      this.$socket.on('UPDATE_USER_LIST', users => {
        this.userList = users
      })
      this.$socket.on('LOGIN_SUCCESS', () => {
        this.$router.replace({
          name: 'multi_guess_AB_main'
        })
      })
      this.$socket.on('LOGIN_FAIL', msg => {
        alert(msg)
      })
    }
  }
</script>

<style lang="scss" src="./style.scss" scoped></style>
