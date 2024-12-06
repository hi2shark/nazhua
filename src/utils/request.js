import axios from 'axios';
import uuid from '@/utils/uuid';

import CustomError from './custom-error';

const limit = 10;

const requestTagMap = {};

/**
 * axios请求
 * @param {object} options 请求参数
 * @return {Promise}
 */
async function axiosRequest(options) {
  return axios(options).then((res) => {
    if (res.status === 200) {
      return res;
    }
    throw new CustomError(`网络错误${res.status}`, res.status);
  });
}

/**
 * 网络请求
 */
class NetworkRequest {
  constructor() {
    this.tasks = [];
    this.tasking = 0;
  }

  /**
   * 是否为Form请求
   */
  static FormRequest = (headers) => {
    if (!headers) return false;
    const keys = Object.keys(headers);
    for (let i = 0, n = keys.length; i < n; i += 1) {
      if (keys[i].toLowerCase() === 'content-type') {
        return headers[keys[i]].includes('x-www-form-urlencoded');
      }
    }
    return false;
  };

  /**
   * 添加请求
   *
   * @param {string} url 请求的相对路径
   * @param {string} type 请求的Method
   * @param {object} headers Header请求参数
   * @param {object} data 请求参数
   * @param {boolean} defaultContentType 默认的请求方式
   * @param {Boolean} priority 优先调用请求
   *
   * @return {Promise}
   */
  push(
    options = {},
    controller = {},
    priority = false,
  ) {
    const {
      url,
      type,
      headers,
      data,
      defaultContentType = true,
      requestTag = undefined,
      responseType,
    } = options || {};
    const {
      abortController,
    } = controller || {};
    const tag = requestTag || uuid();

    if (requestTagMap[tag]) {
      return requestTagMap[tag];
    }

    return new Promise((resolve, reject) => {
      const defaultHeaders = {};
      if (defaultContentType === false) {
        if (NetworkRequest.FormRequest(defaultHeaders)) {
          defaultHeaders['content-type'] = 'application/json';
        } else {
          defaultHeaders['content-type'] = 'application/x-www-form-urlencoded';
        }
      }
      const requestOptions = [
        {
          url,
          method: type,
          headers: {
            ...defaultHeaders,
            ...headers,
          },
          data,
          signal: abortController?.signal ?? undefined,
          responseType,
        },
        (res) => {
          resolve(res);
        },
        (err) => {
          reject(err);
        },
        tag,
      ];
      if (priority) {
        this.tasks.unshift(requestOptions);
      } else {
        this.tasks.push(requestOptions);
      }
      this.nextTask();
    });
  }

  /**
   * 下一个请求任务
   */
  nextTask() {
    if (this.tasking >= limit) {
      setTimeout(() => {
        this.nextTask();
      }, 1000);
      return;
    }
    if (this.tasks.length === 0) {
      return;
    }
    const [options, success, fail, tag] = this.tasks.pop();
    // 请求未执行已被中止
    if (options?.signal?.aborted) {
      this.overTask();
      return;
    }
    requestTagMap[tag] = axiosRequest(options);
    requestTagMap[tag].finally(() => {
      this.overTask();
      // 一秒内请求不重复
      setTimeout(() => {
        delete requestTagMap[tag];
      }, 1000);
    });
    requestTagMap[tag].then(success).catch(fail);
    this.tasking += 1;
  }

  /**
   * 结束请求任务
   */
  overTask() {
    this.tasking -= 1;
    this.nextTask();
  }
}

const request = new NetworkRequest();

export {
  NetworkRequest,
};

export default (...args) => request.push(...args);
