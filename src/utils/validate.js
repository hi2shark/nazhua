/**
 * 校验方法
 */

const validate = {
  /**
   * 判断值是否已经设置类型数据
   * null|undefined为false
   */
  isSet(val) {
    if (
      val === null
      || val === undefined
    ) {
      return false;
    }
    return true;
  },
  /**
   * 判断是否为空值
   * null|undefined|空字符串 绝对为空
   * 空对象、空数组根据拓展选项来控制
   *
   * @param {Any} val 验证值
   * @param {Object|Boolean} options 验证选项
   * @param {Boolean} options.allEmpty 全部验证
   * @param {Boolean} options.objectEmpty 对象验证
   * @param {Boolean} options.arrayEmpty 数组验证
   *
   * @return {Boolean} 是否为空
   */
  isEmpty(val, options = null) {
    let allEmpty = false;
    let objectEmpty = false;
    let arrayEmpty = false;
    if (options === true) {
      allEmpty = true;
    } else {
      const emptyOptions = options || {};
      allEmpty = emptyOptions.allEmpty;
      objectEmpty = emptyOptions.objectEmpty;
      arrayEmpty = emptyOptions.arrayEmpty;
    }

    if (
      val === null
      || val === undefined
      || (
        val.constructor.name === 'String'
        && val === ''
      )
    ) {
      return true;
    }
    if (
      (allEmpty || objectEmpty)
      && val.constructor.name === 'Object'
      && Object.getOwnPropertyNames(val).length === 0
    ) {
      return true;
    }
    if (
      (allEmpty || arrayEmpty)
      && Array.isArray(val)
      && val.length === 0
    ) {
      return true;
    }
    return false;
  },
  /**
   * 是否为对象
   */
  isObject(val) {
    return typeof val === 'object' && val !== null && val.constructor.name === 'Object';
  },
  hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  },
};

export default validate;
