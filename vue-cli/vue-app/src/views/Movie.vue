<template>
  <div id="movie">
    <section class="movie-list" v-for="obj in movieList" :key="obj.id" @click="goDetails(obj.id)">
      <img class="movie-img" :src="obj.cover" alt="">
      <div class="movie-info">
        <h4>{{obj.title}}</h4>
        <p>评分：{{obj.rate}}</p>
      </div>
    </section>

    <div id="cover" v-show="cover">
      <img src="../assets/images/loading.gif" alt="">
    </div>
  </div>
</template>

<script>
  // 引入axios
  import axios from 'axios'
// let url = https://bird.ioliu.cn/v1?url=https://movie.douban.com/j/search_subjects?type=movie&tag=%E7%83%AD%E9%97%A8&sort=recommend&page_limit=10&page_start=${this.start}

export default {
  data() {
    return {
      // 电影列表
      movieList: [],
      // 每页请求多少条数据
      pageCount: 10,
      // 每次从第几条开始请求
      pageStart: 0,
      cover: false
    }
  },
  methods: {
    // 获取电影列表数据
    getList() {
      this.cover = true
      // axios.get(url) 发送get请求
      // url 请求地址
      axios.get(`https://bird.ioliu.cn/v1?url=https://movie.douban.com/j/search_subjects?type=movie&tag=%E7%83%AD%E9%97%A8&sort=recommend&page_limit=${this.pageCount}&page_start=${this.pageStart}`).then(res => {
        // 请求成功的回调
        console.log(res)
        this.cover = false
        // this.movieList = res.data.subjects
        this.movieList = [...this.movieList,...res.data.subjects]

      }).catch(err => {
        this.cover = false
        // error时的回调
        console.log(err)
      })
    },
    // 进入电影详情页面
    goDetails(id) {
      this.$router.push({
        path: '/moviedetails',
        query: {
          id
        }
      })
    }
  },
  // data属性能获取到
  // 一版情况下 如果进入页面就要获取数据 会在created钩子函数内获取数据
  created() {
    // vue实例创建完成后，立马获取当前页面需要的数据
    this.getList()

    // 监听window的滚动事件，只要页面滚动就进入到这个方法里
    window.onscroll = () => {
      // 当前可视区域高度（电影页面高度）
      let clientHeight = document.documentElement.clientHeight
      // 电影页面可滚动的高度
      let scHeight = document.documentElement.scrollHeight
      // 电影页面滚动出去的高度
      let topHeight = document.documentElement.scrollTop
      // 当滚动出去的高度和页面可视区域的高度的和等于页面可滚动高度（表示页面滚动到底部）
      if(scHeight === clientHeight + topHeight) {
        // this.pageStart = this.pageStart + this.pageCount
        this.pageStart = this.movieList.length 
        this.getList()
        
      }
    }

  }
}

</script>

<style lang="scss" scoped>
  #movie{
    // position: relative;
    .movie-list{
      display: flex;
      padding: 0.2rem;
      border-bottom: 1px solid #ccc;

      .movie-img{
        width: 1.5rem;
      }
      .movie-info{
        flex: 1;
        margin-left: 0.1rem;
      }
    }

    #cover{
      background: rgba(0,0,0,0.6);
      position: fixed;
      top: 1rem;
      left: 0;
      right: 0;
      bottom: 1rem;

      img{
        width: 2rem;
        margin: 3rem auto 0;
        position: absolute;
        // top: 50%;
        left: 50%;
        transform: translateX(-50%);
      }
    }

  }

</style>