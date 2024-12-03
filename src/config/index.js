const config = {
  request: {
    headers: {
      // 如果设置的是json请求。api的defaultContentType为false的时候，contentType为form请求，反之亦如此
      'Content-Type': 'application/json',
    },
    codeField: 'code', // code字段
    dataField: 'result', // 数据字段
    msgField: 'message', // 消息字段
    okCode: '0', // 数据通过code
    limit: 10,
  },
  nazhua: {
    title: '哪吒监控',
    apiMonitorPath: '/api/v1/monitor/{id}',
    wsPath: '/ws',
    nezhaPath: '/nezha/',
    nezhaV0ConfigType: 'servers',
    // 解构载入自定义配置
    ...(window.$$nazhuaConfig || {}),
  },
};

export function mergeNazhuaConfig(customConfig) {
  Object.keys(customConfig).forEach((key) => {
    config.nazhua[key] = customConfig[key];
  });
}

export default config;
