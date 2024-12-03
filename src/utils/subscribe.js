/**
 * 消息订阅器
 */

class MessageSubscribe {
  constructor() {
    this.subscribers = {};
  }

  /**
   * 订阅消息
   * @params {String} key 消息类型
   * @params {Function} callback 回调函数
   */
  on(key, callback) {
    if (!this.subscribers[key]) {
      this.subscribers[key] = [];
    }
    this.subscribers[key].push(callback);
    if (import.meta.env.VITE_LIVE_SUBSCRIBE_DEBUG) {
      console.log('subscribers on by key:', key);
      console.log('subscribers on', this.subscribers);
    }
  }

  /**
   * 订阅一次消息
   * @params {String} key 消息类型
   * @params {Function} callback 回调函数
   */
  once(key, callback) {
    const onceCallback = (...args) => {
      callback(...args);
      this.off(key, onceCallback);
    };
    this.on(key, onceCallback);
  }

  /**
   * 取消订阅
   * @params {String} key 消息类型
   * @params {Function} callback 回调函数
   */
  off(key, callback) {
    if (!this.subscribers[key]) {
      return;
    }
    const index = this.subscribers[key].indexOf(callback);
    if (index !== -1) {
      this.subscribers[key].splice(index, 1);
    }
    if (import.meta.env.VITE_LIVE_SUBSCRIBE_DEBUG) {
      console.log('subscribers off by key:', key);
      console.log('subscribers off', this.subscribers);
    }
  }

  /**
   * 发布消息
   * @params {String} key 消息类型
   * @params {Object} data 消息数据
   */
  emit(key, data) {
    if (!this.subscribers[key]) {
      return;
    }
    this.subscribers[key].forEach((callback) => {
      callback(data);
    });
    if (import.meta.env.VITE_LIVE_SUBSCRIBE_DEBUG) {
      console.log('subscribers emit by key:', key);
      console.log('subscribers emit', key, this.subscribers[key]);
    }
  }
}

export default MessageSubscribe;
