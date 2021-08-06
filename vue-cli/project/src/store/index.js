import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  // state 存储组件共享的属性
  state: {
    count: 1,
    price: 10
  },
  // 类似于计算属性（对state中的某些属性进行修改计算）
  getters: {
    amount(state) {
      return state.count * state.price
    }
  },
  // mutations 中的方法是唯一可以修改state中属性的方法
  // mutations 是同步的操作，只能在mutations中直接修改state
  mutations: {
    add(state, data) {
      state.count+=data
    },
    reduce(state) {
      state.count--
    }
  },
  // 定义异步的操作
  actions: {
    // 形参 {commit}
    reduce({commit}) {
      setTimeout(() => {
        // 通过commit调用mutations里的方法再去修改state
        commit('reduce')
      }, 1500)
    }
  },
  modules: {
  }
})
