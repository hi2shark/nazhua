import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router';
import config from '@/config';
import pageTitle from '@/utils/page-title';

const constantRoutes = [{
  name: 'Home',
  path: '/',
  component: () => import('@/views/home.vue'),
}, {
  name: 'ServerDetail',
  path: '/:serverId(\\d+)',
  component: () => import('@/views/detail.vue'),
  meta: {
    title: '节点详情',
  },
  props: true,
}, {
  path: '/:pathMatch(.*)*',
  redirect: {
    name: 'Home',
  },
}];

const routerOptions = {
  history: config.nazhua.routeMode === 'h5' ? createWebHistory() : createWebHashHistory(),
  scrollBehavior: () => ({
    top: 0,
    behavior: 'smooth',
  }),
  routes: constantRoutes,
};
const router = createRouter(routerOptions);

router.beforeResolve((to, from, next) => {
  pageTitle(to?.meta?.title);
  next();
});

export default router;
