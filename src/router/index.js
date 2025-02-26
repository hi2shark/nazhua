import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router';
import config from '@/config';
import i18n from '@/i18n';
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
    title: () => i18n.global.t('serverDetail'),
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
  scrollBehavior: (to, from, savedPosition) => {
    if (savedPosition) {
      return savedPosition;
    }
    return {
      top: 0,
      behavior: 'smooth',
    };
  },
  routes: constantRoutes,
};
const router = createRouter(routerOptions);

router.beforeResolve((to, from, next) => {
  if (to?.meta?.title) {
    const title = typeof to.meta.title === 'function' ? to.meta.title() : to.meta.title;
    pageTitle(title);
  } else if (to.name === 'Home') {
    pageTitle(config.nazhua.title);
  }
  next();
});

export default router;
