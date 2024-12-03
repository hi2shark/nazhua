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
  const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
  const variance = data.reduce((sum, value) => sum + (value - mean) ** 2, 0) / data.length;
  const stdDev = Math.sqrt(variance);
  const threshold = tolerance * stdDev;
  const filteredData = data.filter((value) => value !== 0);
  const min = Math.min(...filteredData);
  const max = Math.max(...filteredData);
  return {
    threshold,
    mean,
    min,
    max,
  };
}
