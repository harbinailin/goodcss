<template>
  <div id="photo">
    <img v-for="(item, index) in list" :key="index" :src="item.src" alt="" @click="goDetails(index)">
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      // list: []
    }
  },
  computed: {
    list() {
      return this.$store.state.photoList
    }
  },
  methods: {
    getList( ){
      axios.get('/data/photodata.json').then( res=> {
        console.log(res)
        // this.list = res.data.photoData
        this.$store.commit('setList', res.data.photoData)
      }).catch( err=>{
        console.log(err)
      } )
    },
    goDetails(index){
      this.$router.push(`/photodetails/${index}`)
    }
  },
  created() {
    this.getList()
  }
}
</script>

<style lang="scss" scoped>
  #photo{
    img{
      width: 50%;
    }
  }
</style>