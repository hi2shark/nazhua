/**
 * v1 后端 TSDB 相关判断
 * tsdb_enabled 为 true 时：用 period=1d 拉取监控数据，WS 不返回 tcp/udp，前端需隐藏连接数展示
 */
import config from '@/config';

/**
 * 是否开启 TSDB（v1 且 setting 中 tsdb_enabled 为 true）
 * @param {import('vuex').Store} store
 * @returns {boolean}
 */
export function isTsdbEnabled(store) {
  if (config.nazhua.nezhaVersion !== 'v1' || !store?.state?.setting) {
    return false;
  }
  const { setting } = store.state;
  return setting?.config?.tsdb_enabled === true || setting?.tsdb_enabled === true;
}

/**
 * 是否有 tsdb_enabled 字段（存在即可，不要求为 true）
 * @param {import('vuex').Store} store
 * @returns {boolean}
 */
export function hasTsdb(store) {
  if (config.nazhua.nezhaVersion !== 'v1' || !store?.state?.setting) {
    return false;
  }
  const { setting } = store.state;
  return 'tsdb_enabled' in (setting?.config ?? {}) || 'tsdb_enabled' in (setting ?? {});
}
