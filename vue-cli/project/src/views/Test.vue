<template>
  <div>
    <h1>端午节活动</h1>
  </div>
</template>

<script>
export default {
  data() {
    return {

    }
  },
  methods: {

  },
  beforeRouteEnter(to, from, next) {
    console.log('to:', to)
    console.log('from:', from)
    next()
  }
}
</script>

<style>

</style>