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
      >
    </div>
    <button @click="submitLoginData">送出</button>

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
        }
      }
    },
    methods: {
      submitLoginData() {
        this.$socket.emit('login', this.user)
      }
    },
    mounted() {
      this.$socket.on('login_success', () => {
        this.$router.replace({
          name: 'multi_guess_AB_main'
        })
      })
      this.$socket.on('login_fail', msg => {
        alert(msg)
      })
    }
  }
</script>

<style lang="scss" src="./style.scss" scoped></style>
