<template>
  <section class="container">
    <div>
      <ul>
        <li>
          <nuxt-link :to="{name: 'chat'}">CHAT</nuxt-link>
        </li>
        <li>
          <nuxt-link :to="{name: 'TicTacToe'}">TicTacToe</nuxt-link>
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
  export default {
    components: {}
  }
</script>

<style>
  .container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
</style>
