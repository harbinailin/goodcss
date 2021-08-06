// 配置当前项目的router信息
import Vue from 'vue'
import VueRouter from 'vue-router'

// 引入各个页面级别的组件
import Home from '../views/Home.vue'

import Course from '../views/Course.vue'
import Fe from '../views/Fe.vue'
import Rd from '../views/Rd.vue'

import Users from '../views/Users.vue'
import Details from '../views/Details.vue'
import Test from '../views/Test.vue'

import Error from '../views/Error.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    // 当前页面的路径
    path: '/course',
    // 定义当前页面组件的名称
    name: 'Course',
    // 配置组件
    component: Course,
    // 配置子路由信息
    children: [
      {
        path: 'fe', // /course/fe
        name: 'Fe',
        component: Fe
      },
      {
        path: 'rd',
        name: 'Rd',
        component: Rd
      }
    ]
  },
  {
    path: '/users',
    name: 'Users',
    component: Users
  },
  {
    path: '/details/:id',
    name: 'Details',
    component: Details
  },
  {
    path: '/test',
    name: 'Test',
    component: Test,
    // 重定向
    // redirect: '/about',
    // 起别名
    // alias: '/aaa',
    // 导航守卫
    // beforeEnter: (to, from, next ) => {
    //   // to 代表要进入的页面的路由信息
    //   console.log(to)
    //   // from 代表当前页面的路由信息
    //   console.log(from)
    //   if( from.name == 'About') {
    //     next('/')
    //   } else {
    //     next()
    //   }
    // }
  },
  {
    // 通配符选择器，一定要配置在路由的最后面
    path: '*',
    name: Error,
    component: Error
  }
]

const router = new VueRouter({
  // 配置路由模式 history/hash
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router
