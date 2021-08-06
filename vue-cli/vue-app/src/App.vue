<template>
  <div id="app">
    <common-header :config="selectMenu" @changemenu="setMenu"></common-header>

    <div id="container">
      <router-view/>
    </div>

    <common-footer :config="selectMenu" @changemenu="setMenu"></common-footer>
  </div>
</template>

<script>
// @ is an alias to /src
import commonHeader from '@/components/CommonHeader.vue'
import commonFooter from '@/components/CommonFooter.vue'

export default {
  data(){
    return {
      // 被选中的菜单
      selectMenu: {
        title: '电影',
        color: '#00a1d6',
      },
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
  // 引入组件
  components: {
    commonHeader,
    commonFooter
  },
  methods: {
    // 接收子组件footer传过来的参数（当前被选中菜单的内容）
    setMenu(data) {
      this.selectMenu.title = data.name
      this.selectMenu.color = data.color
    }
  },
  created() {
    console.log(this.$route)
    this.menuList.forEach(item => {
      if(item.path == this.$route.path) {
        this.setMenu(item)
      }
    })
  }
}
</script>
<style lang="scss">
  #app{
    #container{
      margin-top: 1rem;
      padding-bottom: 1rem;
    }
  }
</style>
