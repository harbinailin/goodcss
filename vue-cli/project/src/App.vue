<template>
  <!-- 最外层的父组件 -->
  <div id="app">
    <div id="nav">
      <!-- 页面跳转 -->
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link> ｜ 
      <!-- 
        router-link 页面跳转（编译后会生成一个a标签）
          to 表示跳转的路径（对应的是router/index.js中页面path）
            1）字符串（对应页面的path）
            2) 可以是一个对象 配置页面跳转传参
       -->
      <router-link to="/course">课程分类</router-link> | 

      <!-- 
          query形式传参，可以使用path和name
          参数会拼接在URL上
          页面刷新，链接上的参数不会丢失
          to: {
            path: '/users', // 跳转页面的路径
            query: { // 以query形式传参，是一个object 
              name: 'zs',
              age: 18
            }
          }
          
          http://localhost:8081/users?name=zs&age=18
       -->
      <!-- <router-link :to="{path: '/users', query: {name: 'zs', age: 18}}">用户详情(query)</router-link> |  -->
      <!-- 
        to: {
            name: 'User', // 跳转页面的name
            query: { // 以query形式传参，是一个object 
              name: 'zs',
              age: 18
            }
          }
       -->
      <router-link :to="{name: 'Users', query: {name: 'zs', age: 18}}">用户详情(query)</router-link> |
      
      <!-- 
        params形式传参，只能使用name
          参数不会拼接在URL上
          页面刷新，参数会丢失
          to: {
            name: 'Users', // 跳转页面的路径
            params: { // 以params形式传参，是一个object 
              name: 'zs',
              age: 18
            }
          }

       -->
      <router-link :to="{name: 'Users', params: {name: 'zs', age: 18}}">用户详情(params)</router-link> | 
      <!-- 
        url方式传参
        参数会拼接在URL上，刷新页面参数不会丢失
          1.改造router/index.js  
            path属性后面增加 '/:属性名'
          2.在页面跳转的to属性上拼上属性值 '/path/属性值'
       -->
      <router-link to="/details/123">活动详情</router-link> | 

      <router-link to="/test">Test</router-link>
    </div>

    <!-- 
        路由对应的页面
        可以理解为在当前页面占位，页面切换时，页面的内容显示在 router-view 的位置上
    -->
    <router-view/>
  </div>
</template>

<style lang="scss" scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
