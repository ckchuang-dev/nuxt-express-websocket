<template>
  <div id="pg_multi_main_guessing_number">
    <h1>遊戲大廳</h1>
    <Button>創建新房間</Button>
    <!-- <Button>加入房間</Button> -->
    <h3>房間列表</h3>
    <nuxt-link :to="{name: 'multi_guess_AB_room',params:{roomId: '1'}}">
      <Button @click="joinRoom('1')">Room 1</Button>
    </nuxt-link>
    <nuxt-link :to="{name: 'multi_guess_AB_room',params:{roomId: '2'}}">
      <Button @click="joinRoom('2')">Room 2</Button>
    </nuxt-link>
    <nuxt-link :to="{name: 'multi_guess_AB_room',params:{roomId: '3'}}">
      <Button @click="joinRoom('3')">Room 3</Button>
    </nuxt-link>
  </div>
</template>

<script>
  export default {
    name: 'Main',
    head: {
      title: '1A2B Guessing Number'
    },
    data() {
      return {}
    },
    methods: {
      joinRoom(roomId) {
        this.$socket.emit('join', 'user1', roomId)
      }
    }
  }
</script>

<style lang="scss" src="./style.scss" scoped></style>
