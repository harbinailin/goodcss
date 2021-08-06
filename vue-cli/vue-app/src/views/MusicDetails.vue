<template>
  <div>
    <aplayer v-if="list.length>0" :audio="list" :lrcType="3" />
  </div>
</template>

<script>

import Vue from 'vue';
import Aplayer from '@moefe/vue-aplayer';
Vue.use(Aplayer)

import axios from 'axios'

export default {
  data() {
    return {
      audio: {
        name: '东西（Cover：林俊呈）',
        artist: '纳豆',
        url: 'https://cdn.moefe.org/music/mp3/thing.mp3',
        cover: 'https://p1.music.126.net/5zs7IvmLv7KahY3BFzUmrg==/109951163635241613.jpg?param=300y300', // prettier-ignore
        lrc: 'https://cdn.moefe.org/music/lrc/thing.lrc',
      },
      list: []
    }
  },
  methods: {
    // 获取歌单数据
    getData() {
      axios.get('/data/musicdata.json').then( res=> {
        console.log(res)
        this.list = res.data.musicData
      }).catch( err => {
        console.log(err)
      })
    }
  },
  created() {
    this.getData()
  }
}
</script>

<style>

</style>