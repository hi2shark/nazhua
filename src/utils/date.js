import dayjs from 'dayjs';

/**
 * 计算时长工具
 * @param {Date|Number|String} startDate 开始时间
 * @param {Date|Number|String} endDate 结束时间
 * @param {Boolean} noSub 不带子单位
 *
 * @returns {String} 时长
 *  1. 1小时以内，显示N分钟N秒
 *  2. 1小时以上，显示N小时N分钟
 *  3. 1天以上，显示N天
 */
export const duration = (startDate, endDate, noSub = false) => {
  const startTime = dayjs(startDate).valueOf();
  const endTime = dayjs(endDate).valueOf();
  const diff = endTime - startTime;

  if (diff < 0) {
    return '刚刚启动';
  }

  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  if (diff < minute) {
    return `${Math.floor(diff / second)}秒`;
  }
  if (diff < hour) {
    if (noSub) {
      return `${Math.floor(diff / minute)}分钟`;
    }
    return `${Math.floor(diff / minute)}分钟${Math.floor((diff % minute) / second)}秒`;
  }
  if (diff < day) {
    if (noSub) {
      return `${Math.floor(diff / hour)}小时`;
    }
    return `${Math.floor(diff / hour)}小时${Math.floor((diff % hour) / minute)}分钟`;
  }
  return `${Math.floor(diff / day)}天`;
};

/**
 * 计算时长，返回详细信息
 * @param {Date|Number|String} startDate 开始时间
 * @param {Date|Number|String} endDate 结束时间
 */
export const duration2 = (startDate, endDate) => {
  const startTime = dayjs(startDate).valueOf();
  const endTime = dayjs(endDate).valueOf();
  const diff = endTime - startTime;

  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  const result = {
    days: Math.floor(diff / day),
    hours: Math.floor(diff / hour) % 24,
    minutes: Math.floor(diff / minute) % 60,
    seconds: Math.floor(diff / second) % 60,
    $symbol: {
      day: '天',
      hour: '小时',
      minute: '分钟',
      second: '秒',
    },
  };

  return result;
};

/**
 * 按周期月数计算下一个日期，必须大于传入的第三个参数（指定日期，为空则为当前日期）
 *
 * @param {Date|Number|String} startDate 起始日期
 * @param {Number} months 周期月份数
 * @param {Date|Number|String} specifiedDate 指定日期
 *
 * @returns {Number} 下一个日期的时间毫秒数
 */
export function getNextCycleTime(startDate, months, specifiedDate) {
  const start = dayjs(startDate);
  const checkDate = dayjs(specifiedDate);

  if (!start.isValid() || months <= 0) {
    throw new Error('参数无效：请检查起始日期、周期月份数和指定日期。');
  }

  let nextDate = start;

  // 循环增加周期直到大于当前日期
  let whileStatus = true;
  while (whileStatus) {
    nextDate = nextDate.add(months, 'month');
    whileStatus = nextDate.valueOf() <= checkDate.valueOf();
  }

  return nextDate.valueOf(); // 返回时间毫秒数
}
