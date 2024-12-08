import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import frame_routes from '@/router/frame';
import login_routes from '@/router/login';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: frame_routes.concat(login_routes),
});

// 拦截
router.beforeEach((to, from) => {
  const authStore = useAuthStore();
  if (!authStore.isLogined && to.name !== 'login') {
    return { name: 'login' };
  }
});

export default router;
