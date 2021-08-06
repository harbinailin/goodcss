<template>
  <div>
    <h1>用户详情</h1>
    <div>
      <h6>query接收参数</h6>
      <!-- 
         在组件内有一个$route属性，表示当前组件的路由信息
          $route.path  组件的path
          $route.query  通过query传的参数都可以在这个对象下获取到
       -->
      <p>姓名：{{$route.query.name}}</p>
      <p>年龄：{{$route.query.age}}</p>
    </div>

    <div>
      <h6>接收params参数</h6>
      <!-- 
         在组件内有一个$route属性，表示当前组件的路由信息
          $route.params  通过params传的参数都可以在这个对象下获取到
       -->
      <p>姓名：{{$route.params.name}}</p>
      <p>年龄：{{$route.params.age}}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Users',
  data() {
    return {
      query: this.$route.query,
      params: this.$route.params
    }
  }
}
</script>

<style>

</style>