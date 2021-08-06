<template>
  <footer id="footer" :style="{background: config.color}">
    <!-- <router-link to="/">电影</router-link>
    <router-link to="/music">音乐</router-link>
    <router-link to="/book">图书</router-link>
    <router-link to="/photo">图片</router-link> -->

    <!-- 
        v-for 循环的时候 要绑定一个key属性，且对应的值必须是唯一的不能重复
     -->
    <nav class="footer-link" v-for="obj in menuList" :key="obj.path" @click="chooseNav(obj)">
      <!-- <router-link v-for="obj in menuList" :key="obj.path" :to="obj.path" >{{obj.name}}</router-link> -->
      <router-link :to="obj.path" >{{obj.name}}</router-link>
    </nav>
  </footer>
</template>

<script>
export default {
  data() {
    return {
      // 当前菜单栏的背景色
      curBgColor: '#00a1d6',
      // 当前菜单内容
      menuList: [
        {
          name: '电影',
          path: '/',
          color: '#00a1d6'
        },
        {
          name: '音乐',
          path: '/music',
          color: '#C20C0C'
        },
        {
          name: '图书',
          path: '/book',
          color: '#00B51D'
        },
        {
          name: '图片',
          path: '/photo',
          color: '#ffe300'  
        }
      ]
    }
  },
  props: ['config'],
  methods: {
    // 获取当前点击的菜单项里的颜色，并且赋值给默认颜色的属性
    chooseNav(obj) {
      // this.curBgColor = obj.color

      // 把被选中菜单的信息传给父组件
      this.$emit('changemenu', obj)
    }
  }
}
</script>

<style lang="scss" scoped>
  #footer{
    display: flex;
    width: 100%;
    height: 1rem;
    line-height: 1rem;
    text-align: center;
    background: pink;
    position: fixed;
    bottom: 0;
    left: 0;

    .footer-link{
      flex: 1;
    }
    a{
      color: #000;
    }
    .router-link-exact-active{
      color: #fff;
    }
  }
</style>