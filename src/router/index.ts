import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '../stores/auth'
import pinia from '../stores/pinia'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      meta: { requiresAuth: true },
      component: () => import('../views/DashboardView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore(pinia)
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { path: '/' }
  }
  if (to.path === '/' && authStore.isAuthenticated) {
    return { path: '/dashboard' }
  }
  return true
})

export default router
