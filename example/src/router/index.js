import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../pages/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/features',
    name: 'Features',
    component: () => import('../pages/Features.vue')
  },
  {
    path: '/quick-start',
    name: 'QuickStart',
    component: () => import('../pages/QuickStart.vue')
  },
  {
    path: '/docs',
    name: 'Docs',
    component: () => import('../pages/Docs.vue')
  },
  {
    path: '/examples',
    name: 'Examples',
    component: () => import('../pages/Examples.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
