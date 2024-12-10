import {
  reactive,
} from 'vue';
import {
  loadProfile as loadNezhaV1Profile,
} from '@/utils/load-nezha-v1-config';

const defaultNezhaVersion = import.meta.env.VITE_NEZHA_VERSION;

const config = reactive({
  init: false,
  nazhua: {
    title: '哪吒监控',
    // 如果打包禁用 Sarasa Term SC 字体，默认为禁用该字体的配置
    disableSarasaTermSC: import.meta.env.VITE_DISABLE_SARASA_TERM_SC === '1',

    nezhaVersion: ['v0', 'v1'].includes(defaultNezhaVersion) ? defaultNezhaVersion : null,
    apiMonitorPath: '/api/v1/monitor/{id}',
    wsPath: '/ws',
    nezhaPath: '/nezha/',
    nezhaV0ConfigType: 'servers',
    v1ApiMonitorPath: '/api/v1/service/{id}',
    v1WsPath: '/api/v1/ws/server',
    v1ApiGroupPath: '/api/v1/server-group',
    v1ApiSettingPath: '/api/v1/setting',
    v1ApiProfilePath: '/api/v1/profile',
    // 解构载入自定义配置
    ...(window.$$nazhuaConfig || {}),
  },
});

if (config.nazhua.nezhaVersion) {
  config.init = true;
}

export function mergeNazhuaConfig(customConfig) {
  Object.keys(customConfig).forEach((key) => {
    config.nazhua[key] = customConfig[key];
  });
}
// 暴露合并配置方法
window.$mergeNazhuaConfig = mergeNazhuaConfig;

export default config;

export const init = async () => {
  await loadNezhaV1Profile(true).then((res) => {
    config.nazhua.nezhaVersion = res ? 'v1' : 'v0';
  });
  config.init = true;
};
