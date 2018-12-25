<template>
  <section class="container">
    <div>
      <nuxt-link :to="{name: 'chat'}">CHAT</nuxt-link>
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
