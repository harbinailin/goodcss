<template>
  <div id="photo-details">
    <v-touch @swipeleft="onSwipeLeft" @swiperight="onSwipeRight">
      <img :src="list[index].src" alt="">
    </v-touch>
  </div>
</template>

<script>
import Vue from 'vue'
import VueTouch from 'vue-touch'
Vue.use(VueTouch, {name: 'v-touch'})

export default {
  data() {
    return {
      index: this.$route.params.index
    }
  },
  computed: {
    list() {
      return this.$store.state.photoList
    }
  },
  methods: {
    onSwipeLeft() {
      this.index++
      if(this.index == this.list.length) {
        this.index = this.list.length-1
      }
    },
    onSwipeRight() {
      this.index--
      if(this.index < 0){
        this.index = 0
      }
    }
  },
  beforeRouteEnter(to,from, next) {
    console.log(to)
    if(from.path == '/photo'){
      next()
    } else {
      next('/photo')
    }
  }
}
</script>

<style lang="scss" scoped>
  #photo-details{
    width: 100%;
    position: absolute;
    top: 1rem;
    bottom: 1rem;
    left: 0;
    right: 0;
    background: rgba(0,0,0,0.7);

    img{
      width: 100%;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
    }
  }
</style>