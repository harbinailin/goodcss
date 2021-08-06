import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    photoList: []
  },
  mutations: {
    setList(state, list) {
      state.photoList = list
    }
  },
  actions: {
  },
  modules: {
  }
})
