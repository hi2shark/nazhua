/**
 * 对象映射封装
 */
class Mapping {
  /**
   * 字符串映射对象
   *
   * @param {Record<string, any>} obj 查找的对象
   * @param {string} key 查找的属性
   *
   * @return {any}
   */
  static mapping(obj, key) {
    // 检查 obj 是否为对象，如果不是，返回 undefined
    if (!obj || typeof obj !== 'object') {
      return undefined;
    }
    // 检查 key 是否为字符串，如果不是，返回 undefined
    if (typeof key !== 'string') {
      return undefined;
    }
    // 检查 key 是否包含非法字符，如果包含，返回 undefined
    if (key.includes('..') || key.startsWith('.') || key.endsWith('.')) {
      return undefined;
    }
    // 如果 key 包含 '.'，使用 reduce 方法递归获取嵌套属性值
    if (key.includes('.')) {
      return key.split('.').reduce((val, k) => (val !== undefined ? Mapping.get(val, k) : undefined), obj);
    }
    // 如果 key 不包含 '.'，直接获取属性值
    return Mapping.get(obj, key);
  }

  /**
   * 获取数据
   * 支持处理数组指针
   * @param {Record<string, any> | any[]} obj 属性对象
   * @param {string} key 属性名称
   * @return {any}
   */
  static get(obj, key) {
    if (!obj || typeof obj !== 'object' || !key) {
      return undefined;
    }
    const indexMatch = key.match(/\[(\d+)\]/);
    if (indexMatch) {
      const [fullMatch, indexStr] = indexMatch;
      const index = Number(indexStr);
      const matchIndex = key.indexOf(fullMatch);
      if (matchIndex === 0) {
        if (Array.isArray(obj) && index < obj.length) {
          const val = obj[index];
          const restKey = key.slice(fullMatch.length);
          return restKey ? Mapping.get(val, restKey) : val;
        }
      } else {
        const pre = key.slice(0, matchIndex);
        const list = obj[pre];
        if (Array.isArray(list) && index < list.length) {
          const val = list[index];
          const restKey = key.slice(matchIndex + fullMatch.length);
          return restKey ? Mapping.get(val, restKey) : val;
        }
      }
      return undefined;
    }
    return obj[key];
  }

  /**
   * 数据根据key的映射进行组装
   *
   * @param {KeyMap} keys 映射对象
   * @param {Record<string, unknown>} data 数据对象
   *
   * @return {Record<string, unknown>}
   */
  static each(keys, data) {
    // 检查 keys 是否为对象，如果不是，返回 undefined
    if (!keys || typeof keys !== 'object') {
      return undefined;
    }
    // 检查 data 是否为对象，如果不是，返回 undefined
    if (!data || typeof data !== 'object') {
      return undefined;
    }
    return Object.entries(keys).reduce((acc, [key, value]) => {
      if (typeof value === 'string') {
        acc[key] = Mapping.mapping(data, value);
      }
      return acc;
    }, {});
  }
}
const { mapping } = Mapping;

export { Mapping, mapping };

export default mapping;
