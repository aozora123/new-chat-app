import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/chat',
    name: 'ChatMain',
    component: () => import('@/views/ChatView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/chat/:id',
    name: 'Chat',
    component: () => import('@/views/ChatView.vue'),
    meta: { requiresAuth: true },
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  
  console.log('Router guard - to:', to.path, 'isAuthenticated:', isAuthenticated, 'token exists:', !!authStore.token);
  
  // If navigation requires authentication and user isn't authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Check if we have a stored token that might still be valid
    if (authStore.token) {
      // Allow navigation to protected route and let component handle validation
      next();
    } else {
      // No token present, go to login
      console.log('No token found, redirecting to login');
      next('/login');
    }
  } else if (to.meta.requiresGuest && isAuthenticated) {
    // If trying to access guest-only pages while authenticated, redirect to dashboard
    console.log('User is authenticated, redirecting from guest route to dashboard');
    next('/dashboard');
  } else {
    // Otherwise proceed normally
    console.log('Proceeding with navigation to', to.path);
    next();
  }
});

export default router;