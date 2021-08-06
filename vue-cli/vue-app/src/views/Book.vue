<template>
  <div id="book">
    <slider animation="fade" :control-btn="false">
      <slider-item v-for="(item,index) in book" :key="index">
        <img :src="item" alt="">
      </slider-item>
    </slider>
  </div>
</template>

<script>
import { Slider, SliderItem } from "vue-easy-slider";

export default {
  data() {
    return {
      book: [
        "https://img3.doubanio.com/lpic/s24468373.jpg",
        "https://img3.doubanio.com/lpic/s27102925.jpg",
        "https://img3.doubanio.com/lpic/s6989253.jpg",
      ],
    };
  },
  components: {
    Slider,
    SliderItem,
  },
};
</script>

<style lang="scss" scoped>
  #book {
    text-align: center;
    img{
      height: 100%;
    }
  }
</style>