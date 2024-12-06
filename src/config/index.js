import {
  reactive,
} from 'vue';

const defaultNezhaVersion = import.meta.env.VITE_NEZHA_VERSION;

const config = reactive({
  nazhua: {
    title: '哪吒监控',
    nezhaVersion: ['v0', 'v1'].includes(defaultNezhaVersion) ? defaultNezhaVersion : 'v0',
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

export function mergeNazhuaConfig(customConfig) {
  Object.keys(customConfig).forEach((key) => {
    config.nazhua[key] = customConfig[key];
  });
}

export default config;
