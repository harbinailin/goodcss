<template>
  <div>
    <h3>
      web全栈
    </h3>
    <p>课程数量：{{number}}</p>
  </div>
</template>

<script>
export default {
  computed:{
    number() {
      return this.$store.state.count
    }
  }
}
</script>

<style>

</style>