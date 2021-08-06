<template>
  <div id="movie-details" v-if="details && details.data">
    <img :src="details.data[0].poster" alt="">
    <div id="movie-inner">
      <h3>{{details.data[0].name}}</h3>
      <p v-if="details.data[0].description">{{details.data[0].description}}</p>
    </div>
  </div>
</template>

<script>
import axios from "axios"

export default {
  data() {
    return {
      id: this.$route.query.id,
      details: {}
    }
  },
  methods: {
    // 根据路由跳转时带的参数(id),获取对应的电影详情信息
    getDetails() {
      axios.get(`https://movie.querydata.org/api?id=${this.id}`).then(res=> {
        console.log(res)
        this.details = res.data
      }).catch(err => {
        console.log(err)
      })
    }
  },
  created() {
    this.getDetails()
  }
}
</script>

<style lang="scss" scoped>
  #movie-details{
    img{
      width: 100%;
    }
    #movie-inner{
      padding: 0.2rem;
    }
  }
</style>