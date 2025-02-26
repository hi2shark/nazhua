/**
 * 国际化处理
 */
import {
  createI18n,
} from 'vue-i18n';

import config from '@/config';
import zhCN from './config/i18n/zh-cn';
import en from './config/i18n/en';

const i18n = createI18n({
  legacy: false,
  locale: config.nazhua.locale || 'zh-cn',
  fallbackLocale: config.nazhua.locale || 'zh-cn',
  messages: {
    'zh-cn': zhCN,
    en,
  },
});

export default i18n;
