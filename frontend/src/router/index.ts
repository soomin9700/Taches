import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';
import TabsPage from '@/views/TabsPage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/tabs/projets',
  },
  {
    path: '/tabs',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/projets',
      },
      {
        path: 'projets',
        component: () => import('@/views/ProjetPage.vue'),
      },
      {
        path: 'projets/:id',
        component: () => import('@/views/TachesPage.vue'),
      },
    ],
  },
];

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});