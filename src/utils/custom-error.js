/**
 * 自定义错误
 */

class CustomError extends Error {
  constructor(msg, code) {
    super(msg);
    this.code = code;
  }
}

export default CustomError;
