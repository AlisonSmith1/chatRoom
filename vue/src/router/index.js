import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/HomeBlock.vue'
import Login from '../views/LoginBlock.vue'
import Register from '../views/RegisterBlock.vue'
import Chat from '../views/ChatBlock.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  {
    path: '/chat',
    component: Chat,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const accountStr = localStorage.getItem('Account')
  const token = accountStr ? JSON.parse(accountStr).token : null

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
