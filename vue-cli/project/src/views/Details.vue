<template>
  <div>
    <h1>活动详情</h1>
    <!-- 
      url方式传参
        通过$route.params方式获取参数  
    -->
    <p>活动id:{{$route.params.id}}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      params: this.$route.params
    }
  }
}
</script>

<style>

</style>