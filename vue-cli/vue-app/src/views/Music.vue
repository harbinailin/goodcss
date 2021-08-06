<template>
  <div id="music">
    <img v-for="item in musicList" :key="item.id" :src="item.bg" alt="" @click="goDetails">
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      musicList: []
    }
  },
  methods: {
    // 获取音乐榜单列表
    getData() {
      axios.get('/data/musiclist.json').then(res => {
        console.log(res)
        this.musicList = res.data.albums
      }).catch(err => {
        console.log(err)
      })
    },
    // 进入音乐详情页面
    goDetails() {
      this.$router.push('/musicdetails')
    }
  },
  created() {
    this.getData()
  }
}
</script>

<style lang="scss" scoped>
  #music{
    img{
      width: 50%;
    }
  }
</style>