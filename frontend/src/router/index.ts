import { createRouter, createWebHistory } from '@ionic/vue-router';
import TabsPage from '@/views/TabsPage.vue';
import type { RouteRecordRaw } from 'vue-router';

const routes : RouteRecordRaw[] = [
  { path: '/', redirect: '/tabs/menu' },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      // { path: '', redirect: '/tabs/menu' },
      
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
