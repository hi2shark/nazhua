import 'remixicon/fonts/remixicon.css';
import 'flag-icons/css/flag-icons.min.css';
import 'font-logos/assets/font-logos.css';
import './assets/scss/base.scss';
import router from './router';
import store from './store';

export default (app) => {
  app.use(router);
  app.use(store);
};
