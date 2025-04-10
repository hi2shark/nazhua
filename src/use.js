import './load';
import './assets/scss/base.scss';
import router from './router';
import store from './store';
import config from './config';

import DotDotBox from './components/dot-dot-box.vue';
import Popover from './components/popover.vue';
import ServerFlag from './components/server-flag.vue';

export default (app) => {
  app.use(router);
  app.use(store);
  app.component('DotDotBox', DotDotBox);
  app.component('Popover', Popover);
  app.component('ServerFlag', ServerFlag);

  app.config.globalProperties.$hasSarasaTerm = !import.meta.env.VITE_DISABLE_SARASA_TERM_SC;
  app.config.globalProperties.$config = config;
};
