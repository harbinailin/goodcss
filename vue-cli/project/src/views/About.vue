<template>
  <div class="about">
    <h1>This is an about page</h1>
    <button @click="goCourse">跳转到课程分类页面</button>
    <button @click="goUsers">跳转到用户详情页面</button>

    <button @click="goback">back</button>
    <button @click="goforward">forward</button>

  </div>
</template>

<script>

export default {
  methods: {
    goCourse(){
      // vue实例下提供了一个$router属性，$router属性下提供了页面跳转的方法
      /* 
        this.$router.push()
          1.方法里可以传一个字符串，表示跳转页面的path
          2.也可以传一个obj 
          {
            path: '',
            name: '',
            query: {},
            params: {}
          }
      */
      this.$router.push('/course')
      // this.$router.replace('/course')
    },
    goUsers() {
      this.$router.push({
        path: '/users',
        query: {
          name: 'ls',
          age: 20
        }
      })
    },
    goback() {
      this.$router.back()
    },
    goforward() {
      this.$router.forward()
    }
  }
}
</script>

