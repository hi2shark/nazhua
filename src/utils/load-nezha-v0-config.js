import config from '@/config';

function getNezhaConfigUrl() {
  const { nezhaPath } = config.nazhua;
  if (nezhaPath.startsWith('http')) {
    return nezhaPath;
  }
  const a = document.createElement('a');
  if (nezhaPath === '/nezha/' && import.meta.env.VITE_BASE_PATH !== '/') {
    [a.href] = window.location.href.split(import.meta.env.VITE_BASE_PATH);
  } else {
    a.href = nezhaPath;
  }
  return a.href;
}

const configReg = (type) => new RegExp(`${type} = JSON.parse\\('(.*)'\\)`);
// 格式化数据，保证JSON.parse能够正常解析
const unescaped = (str) => {
  let str2 = str.replace(/\\u([\d\w]{4})/gi, (match, grp) => String.fromCharCode(parseInt(grp, 16)));
  str2 = str2.replace(/\\\\r/g, '');
  str2 = str2.replace(/\\\\n/g, '');
  str2 = str2.replace(/\\\\/g, '\\');
  return str2;
};
export default async () => fetch(getNezhaConfigUrl()).then((res) => res.text()).then((res) => {
  let resMatch = res?.match?.(configReg(config.nazhua.nezhaV0ConfigType));
  // 尝试兼容不同的nezha前台主题
  if (!resMatch) {
    resMatch = res?.match?.(configReg(
      config.nazhua.nezhaV1ConfigType === 'servers' ? 'initData' : 'servers',
    ));
  }
  const configStr = resMatch?.[1];
  if (!configStr) {
    return null;
  }
  const remoteConfig = JSON.parse(unescaped(configStr));
  if (remoteConfig?.servers) {
    remoteConfig.servers = remoteConfig.servers.map((i) => {
      const item = {
        ...i,
      };
      try {
        item.PublicNote = JSON.parse(i.PublicNote);
      } catch {
        item.PublicNote = {};
      }
      return item;
    });
    return remoteConfig;
  }
  return null;
}).catch(() => null);

/**
 * 获取标签列表
 */
export const loadServerGroup = (services) => {
  const tagMap = {};
  services.forEach((i) => {
    if (i.Tag) {
      if (!tagMap[i.Tag]) {
        tagMap[i.Tag] = [];
      }
      tagMap[i.Tag].push(i);
    }
  });
  const tagList = [];
  Object.entries(tagMap).forEach(([tag, serviceList]) => {
    tagList.push({
      name: tag,
      count: serviceList.length,
      servers: serviceList.map((i) => i.ID),
      group: {
        name: tag,
      },
    });
  });
  return tagList;
};
