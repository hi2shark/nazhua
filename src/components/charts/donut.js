import { use } from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import {
  BarChart,
} from 'echarts/charts';
import {
  PolarComponent,
} from 'echarts/components';

import config from '@/config';

use([
  SVGRenderer,
  BarChart,
  PolarComponent,
]);

function handleColor(color) {
  if (Array.isArray(color)) {
    return {
      type: 'linear',
      x: 1,
      y: 1,
      x2: 0,
      y2: 0,
      colorStops: [{
        offset: 0,
        color: color[0], // 0% 处的颜色
      }, {
        offset: 1,
        color: color[1], // 100% 处的颜色
      }],
    };
  }
  return color;
}

export default (used, total, itemColors, size = 100) => {
  const isLinear = (
    (config.nazhua.serverStatusLinear || config.nazhua.lightBackground)
    && !config.nazhua.simpleColorMode
  );
  return {
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
        color: typeof itemColors === 'string' ? itemColors : handleColor(itemColors?.used),
        borderRadius: 5,
        shadowColor: (() => {
          if (config.nazhua.serverStatusLinear) {
            return 'rgba(0, 0, 0, 0.5)';
          }
          if (config.nazhua.lightBackground) {
            return 'rgba(0, 0, 0, 0.2)';
          }
          return undefined;
        })(),
        shadowBlur: isLinear ? 10 : undefined,
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
        color: handleColor(itemColors?.total) || 'rgba(255, 255, 255, 0.2)',
      },
      coordinateSystem: 'polar',
      cursor: 'default',
      barWidth: Math.ceil((size / 100) * 10),
      barGap: '-100%', // 两环重叠
      z: 5,
    }],
  };
};
