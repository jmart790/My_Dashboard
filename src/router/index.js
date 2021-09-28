import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/media',
    name: 'Media',
    component: () => import(/* webpackChunkName: "media" */ '../views/MediaPage.vue')
  },
  {
    path: '/news',
    name: 'News',
    component: () => import(/* webpackChunkName: "news" */ '../views/NewsPage.vue')
  },
  {
    path: '/weather',
    name: 'Weather',
    component: () => import(/* webpackChunkName: "weather" */ '../views/WeatherPage.vue')
  },
  {
    path: '/food',
    name: 'Food',
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/FoodPage.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
