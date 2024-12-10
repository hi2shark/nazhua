/**
 * 计算数据的阈值和平均值
 *
 * @param {number[]} data - 要计算的数据数组
 * @param {number} [tolerance=2] - 容差倍数，默认值为2
 * @returns {{threshold: number, mean: number}} 返回包含阈值和平均值的对象
 * @property {number} threshold - 计算得到的阈值
 * @property {number} mean - 数据的平均值
 */
export function getThreshold(data, tolerance = 2) {
  // 计算数据的平均值
  const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
  // 计算数据的方差
  const variance = data.reduce((sum, value) => sum + (value - mean) ** 2, 0) / data.length;
  // 计算标准差
  const stdDev = Math.sqrt(variance);
  // 计算阈值
  const threshold = tolerance * stdDev;
  // 过滤掉值为0的数据
  const filteredData = data.filter((value) => value !== 0);
  // 计算过滤后数据的最小值
  const min = Math.min(...filteredData);
  // 计算过滤后数据的最大值
  const max = Math.max(...filteredData);
  // 返回包含阈值、平均值、最小值和最大值的对象
  return {
    threshold,
    mean,
    min,
    max,
  };
}
