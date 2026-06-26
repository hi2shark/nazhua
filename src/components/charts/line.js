import { use } from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
} from 'echarts/components';
import dayjs from 'dayjs';

import config from '@/config';

use([
  SVGRenderer,
  LineChart,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
]);

function alphaColor(color, alpha, fallback) {
  if (!color) return fallback;
  const normalizedAlpha = Math.max(0, Math.min(alpha, 1));
  const hexMatch = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);

  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex.split('').map((s) => s + s).join('');
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${normalizedAlpha})`;
  }

  const rgbMatch = color.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbMatch) {
    const channels = rgbMatch[1].split(',').slice(0, 3).map((s) => s.trim());
    if (channels.length === 3) {
      return `rgba(${channels.join(', ')}, ${normalizedAlpha})`;
    }
  }

  return fallback;
}

export default (options) => {
  const {
    valueList,
    mode = 'dark',
    connectNulls = true,
    chartConfig = {},
  } = options || {};
  const {
    showDataZoom = true,
    grid: gridConfig = {},
    xAxis: xAxisConfig = {},
    yAxis: yAxisConfig = {},
    tooltip: tooltipConfig = {},
    series: seriesConfig = {},
  } = chartConfig;

  const fontFamily = config.nazhua.disableSarasaTermSC === true
    ? undefined
    : 'Sarasa Term SC';
  const isDark = mode === 'dark';
  const textPrimary = isDark ? '#eee' : '#222';
  const textSecondary = isDark ? '#ddd' : '#222';
  const axisLineColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.4)';
  const splitLineColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.4)';
  const tooltipBg = isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)';
  const tooltipBorder = isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)';
  const tooltipText = isDark ? '#ddd' : '#222';
  const accentPrimary = isDark ? '#4e90ff' : '#4383ff';

  const tooltipValueFormatter = tooltipConfig.valueFormatter;
  const tooltipTimeFormatter = tooltipConfig.timeFormatter;
  const yAxisLabelFormatter = yAxisConfig.formatter;
  const xAxisLabelFormatter = xAxisConfig.formatter;

  const baseGrid = {
    top: 10,
    left: 5,
    right: 5,
    bottom: showDataZoom ? 50 : 24,
    containLabel: true,
  };

  const option = {
    darkMode: isDark,
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: alphaColor(accentPrimary, isDark ? 0.82 : 0.74, accentPrimary),
          type: 'dashed',
          width: 1,
        },
      },
      formatter: (params) => {
        const axisValue = parseInt(params?.[0]?.axisValue, 10);
        const time = tooltipTimeFormatter
          ? tooltipTimeFormatter(axisValue, params)
          : dayjs(axisValue).format('YYYY.MM.DD HH:mm');
        let res = `<p style="font-weight: bold; color: #ff6;">${time}</p>`;
        if (params.length < 10) {
          params.forEach((i) => {
            const pointValue = Array.isArray(i.value) ? i.value[1] : undefined;
            const hasValue = pointValue !== null
              && pointValue !== undefined
              && !Number.isNaN(pointValue);
            const content = tooltipValueFormatter
              ? tooltipValueFormatter(pointValue, i)
              : `${pointValue}ms`;
            res += hasValue
              ? `${i.marker} ${i.seriesName}: ${content}<br>`
              : '';
          });
        } else {
          res += '<table>';
          let trEnd = false;
          params.forEach((i, index) => {
            if (index % 2 === 0) {
              res += '<tr>';
            }
            const pointValue = Array.isArray(i.value) ? i.value[1] : undefined;
            const hasValue = pointValue !== null
              && pointValue !== undefined
              && !Number.isNaN(pointValue);
            const content = tooltipValueFormatter
              ? tooltipValueFormatter(pointValue, i)
              : `${pointValue}ms`;
            res += hasValue
              ? `<td style="padding: 0 4px;">${i.marker} ${i.seriesName}: ${content}</td>`
              : '<td style="padding: 0 4px;"></td>';
            if (index % 2 === 1) {
              res += '</tr>';
              trEnd = true;
            }
          });
          if (!trEnd) {
            res += '</tr>';
          }
          res += '</table>';
        }
        return res;
      },
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      textStyle: {
        color: tooltipText,
        fontFamily,
        fontSize: 14,
      },
    },
    grid: {
      ...baseGrid,
      ...gridConfig,
    },
    dataZoom: showDataZoom ? [{
      id: 'dataZoomX',
      type: 'slider',
      xAxisIndex: [0],
      filterMode: 'filter',
    }] : [],
    yAxis: {
      type: 'value',
      min: yAxisConfig.min,
      max: yAxisConfig.max,
      interval: yAxisConfig.interval,
      splitLine: {
        lineStyle: {
          color: splitLineColor,
        },
      },
      axisLabel: {
        fontFamily,
        color: textSecondary,
        fontSize: 12,
        formatter: yAxisLabelFormatter,
      },
    },
    xAxis: {
      type: 'time',
      min: xAxisConfig.min,
      max: xAxisConfig.max,
      axisLabel: {
        hideOverlap: true,
        nameTextStyle: {
          fontSize: 12,
        },
        fontFamily,
        color: textPrimary,
        formatter: xAxisLabelFormatter,
      },
      axisLine: {
        lineStyle: {
          color: axisLineColor,
        },
      },
    },
    series: valueList.map((i) => ({
      ...i,
      type: 'line',
      smooth: seriesConfig.smooth ?? true,
      connectNulls,
      legendHoverLink: false,
      symbol: 'none',
      sampling: 'lttb',
      lineStyle: {
        width: seriesConfig.lineWidth ?? 1.8,
        shadowBlur: 4,
        shadowColor: alphaColor(
          i.itemStyle?.color || i.lineStyle?.color,
          0.12,
          'transparent',
        ),
        ...(i.lineStyle || {}),
      },
      areaStyle: {
        opacity: seriesConfig.areaOpacity ?? 1,
        color: alphaColor(
          i.itemStyle?.color || i.lineStyle?.color || accentPrimary,
          seriesConfig.areaAlpha ?? (isDark ? 0.1 : 0.08),
          'transparent',
        ),
      },
      emphasis: {
        focus: 'series',
        lineStyle: {
          width: 2.4,
        },
      },
    })),
  };
  return option;
};
