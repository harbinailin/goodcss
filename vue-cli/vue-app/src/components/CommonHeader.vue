<template>
  <header id="header" :style="{background: config.color}">
    <span class="header-back" @click="goHome">首页</span>
    {{config.title}}
  </header>
</template>

<script>
export default {
  props: ['config'],
  methods: {
    goHome() {
      this.$router.push('/')
      this.$emit('changemenu', {
          name: '电影',
          path: '/',
          color: '#00a1d6'
        })
    }
  }
}
</script>

<style lang="scss" scoped>
  #header{
    width: 100%;
    height: 1rem;
    line-height: 1rem;
    text-align: center;
    background: pink;
    position: fixed;
    top: 0;
    left: 0;

    .header-back{
      position: absolute;
      left: 0.1rem;
    }
  }
</style>