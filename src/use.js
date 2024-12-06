import 'remixicon/fonts/remixicon.css';
import 'flag-icons/css/flag-icons.min.css';
import 'font-logos/assets/font-logos.css';
import './assets/scss/base.scss';
import router from './router';
import store from './store';
import config from './config';

import DotDotBox from './components/dot-dot-box.vue';

export default (app) => {
  app.use(router);
  app.use(store);
  app.component('DotDotBox', DotDotBox);
  app.config.globalProperties.$config = config;
};
