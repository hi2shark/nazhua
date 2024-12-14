import uniqolor from 'uniqolor';

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

/**
 * - 处理相对固定折线的颜色
 */
const lineColorMap = {};
const lineColors = [];
const defaultColors = [
  '#5470C6', '#91CC75', '#FAC858', '#EE6666',
  '#73C0DE', '#3BA272', '#FC8452', '#9A60B4',
  '#EA7CCC', '#C23531', '#2F4554', '#61A0A8',
  '#D48265', '#91C7AE', '#749F83', '#CA8622',
  '#BDA29A', '#6E7074', '#546570', '#C4CCD3',
];

/**
 * 将十六进制颜色转换为 RGB 数组
 * @param {string} hex - 十六进制颜色字符串
 * @returns {number[]} 返回包含 RGB 数组的对象
 */
function hexToRgb(hex) {
  // 去掉可能的前缀 "#"
  hex = hex.replace(/^#/, '');
  // 将字符串拆分为 r, g, b 三个部分
  const bigint = parseInt(hex, 16);
  const r = Math.floor(bigint / (256 * 256)) % 256;
  const g = Math.floor(bigint / 256) % 256;
  const b = bigint % 256;
  return [r, g, b];
}

/**
 * 计算两个 RGB 颜色之间的距离
 * @param {number[]} color1 - 第一个颜色的 RGB 数组
 * @param {number[]} color2 - 第二个颜色的 RGB 数组
 * @returns {number} 返回两个颜色之间的距离
 */
function rgbDistance(color1, color2) {
  const [r1, g1, b1] = color1;
  const [r2, g2, b2] = color2;
  return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
}

/**
 * 获取一个随机颜色
 * @returns {string} 返回一个随机颜色的字符串
 */
function getColor(count = 0, len = 0) {
  // 如果尝试次数超过 3 次，返回固定颜色组里面的颜色
  if (count > 3) {
    return defaultColors[len % defaultColors.length];
  }
  const { color } = uniqolor.random({
    saturation: [75, 90],
    lightness: [65, 70],
    differencePoint: 100,
  });
  if (lineColors.includes(color)) {
    return getColor(count + 1, len);
  }
  if (lineColors.some((i) => rgbDistance(
    hexToRgb(i),
    hexToRgb(color),
  ) < 50)) {
    return getColor(count + 1, len);
  }
  return color;
}

/**
 * 获取线的颜色
 * @param {string} name - 线的名称
 * @returns {string} 返回线的颜色
 */
export function getLineColor(name) {
  // 如果已经有了对应的颜色，直接返回
  if (lineColorMap[name]) {
    return lineColorMap[name];
  }
  const color = getColor(0, lineColors.length);
  lineColorMap[name] = color;
  lineColors.push(color);
  return color;
}
