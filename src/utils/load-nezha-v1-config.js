/**
 * V1版数据加载
 */
import config from '@/config';
import request from '@/utils/request';

export const loadServerGroup = async () => request({
  // DELETE: v1GroupPath 兼容 v1ApiGroupPath 到v0.6.0
  url: config.nazhua.v1GroupPath || config.nazhua.v1ApiGroupPath,
  type: 'GET',
}).then((res) => {
  if (res.status === 200 && res.data?.success) {
    const list = res.data?.data || [];
    return list.map((i) => {
      const item = {
        ...i,
        name: i?.group?.name,
        count: i?.servers?.length,
      };
      return item;
    });
  }
  return null;
}).catch(() => null);

/**
 * 加载网站配置
 *
 * 暂时只使用site_name
 */
export const loadSetting = async () => request({
  url: config.nazhua.v1ApiSettingPath,
  type: 'GET',
}).then((res) => {
  if (res.status === 200 && res.data?.success) {
    return res.data?.data || {};
  }
  return null;
}).catch(() => null);

/**
 * 加载个人信息
 */
export const loadProfile = async (check) => request({
  url: config.nazhua.v1ApiProfilePath,
  type: 'GET',
}).then((res) => {
  if (check) {
    return res.status === 200;
  }
  if (res.status === 200 && res.data?.success) {
    return res.data?.data || {};
  }
  return null;
}).catch(() => null);
