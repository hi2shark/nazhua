import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import {
  BarChart,
} from 'echarts/charts';
import {
  PolarComponent,
} from 'echarts/components';

use([
  CanvasRenderer,
  BarChart,
  PolarComponent,
]);

export default (used, total, itemColors, size = 100) => ({
  angleAxis: {
    max: total, // 满分
    // 隐藏刻度线
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      show: false,
    },
    splitLine: {
      show: false,
    },
  },
  radiusAxis: {
    type: 'category',
    // 隐藏刻度线
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      show: false,
    },
    splitLine: {
      show: false,
    },
  },
  polar: {
    center: ['50%', '50%'],
    radius: ['50%', '100%'],
  },
  series: [{
    type: 'bar',
    data: [{
      value: used,
    }],
    itemStyle: {
      color: typeof itemColors === 'string' ? itemColors : itemColors?.used,
      borderRadius: 5,
      shadowColor: 'rgba(0, 0, 0, 0.2)',
      shadowBlur: 10,
      shadowOffsetY: 2,
    },
    coordinateSystem: 'polar',
    cursor: 'default',
    roundCap: true,
    barWidth: Math.ceil((size / 100) * 10),
    barGap: '-100%', // 两环重叠
    z: 10,
  }, {
    type: 'bar',
    data: [{
      value: total,
    }],
    itemStyle: {
      color: itemColors?.total || 'rgba(255, 255, 255, 0.2)',
    },
    coordinateSystem: 'polar',
    cursor: 'default',
    barWidth: Math.ceil((size / 100) * 10),
    barGap: '-100%', // 两环重叠
    z: 5,
  }],
});
