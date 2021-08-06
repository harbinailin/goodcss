<template>
  <!-- 组件的模版部分,组件内必须有一个唯一的根元素 -->
  <div>
    <h1>课程分类</h1>
    <p>课程数量:{{count}}</p>
    <p>课程单价:{{price}}</p>
    <p>课程总价:{{amount}}</p>

    <p><button @click="addhandler">修改课程数量</button></p>
    <p><button @click="reducehandler">减减</button></p>

    <!-- 配置当前页面的子路由页面的跳转链接 -->
    <router-link to="/course/fe">Fe</router-link> | 
    <router-link to="/course/rd">Rd</router-link>

    <!-- 当前子路由页面显示的位置 -->
    <!-- transition页面切换时候的动画效果 -->
    <transition name="fade">
      <router-view/>
    </transition>
    
  </div>
</template>

<script>
/**
 * 获取vuex中state的方法（获取到的属性要定义在computed中）
 *  1.this.$store.state.xxx
 *  2.mapState(['xxx','xxx'])
 * 调用vuex中mutations里方法 -> 同步的方法，可以直接修改state
 *  1.this.$store.commit('fun')
 *  2.mapMutations(['fun1','fun2']) (写在methods中，使用方式同methods中其他方法一样)
 * 调用vuex中actions里的方法 -> 异步的操作
 *  1.this.$store.dispath('fun')
 *  2.matActions(['fun1','fun2'])
 * 调用vuex中getters里的属性（类似于组件中的计算属性，对state中的属性进行复杂的逻辑运算）
 *  1.this.$store.getters.xxx
 *  2.mapGetters(['xxx','xxx'])
 */
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
// 组件的js部分，导出一个vue实例
export default {
  computed: {
    ...mapState(['count', 'price']),
    ...mapGetters(['amount']),
    // number() {
    //   // this.$store.state -> vuex 里的state
    //   return this.$store.state.count
    // },
    // price() {
    //   return this.$store.state.price
    // },
    // amount() {
    //   return this.$store.getters.amount
    // }
  },
  methods: {
    ...mapMutations(['add']),
    ...mapActions(['reduce']),
    addhandler() {
      /* this.$store.commit(fun) 
          触发vuex中mutations中的某一个方法
          fun表在mutations中定义的需要调用的方法名
      */
      this.$store.commit('add', 5)
      // this.add(10)
    },
    reducehandler() {
      // this.$store.dispatch(fun)调用vuex中actions中的方法
      // this.$store.dispatch('reduce')
      this.reduce()
    }
  }
}
</script>

<style lang="scss" scoped>
/* 组件的样式部分 */
  // .[name]-enter
  .fade-enter{
    opacity: 0;
  }
  .fade-leave{
    opacity: 1;
  }
  .fade-enter-active{
    transition: opacity 0.5s;
  }
  .fade-leave-active{
    opacity: 0;
    transition: opacity 0.5s;
  }
</style>