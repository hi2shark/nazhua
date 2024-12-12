import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  TooltipComponent,
  // LegendComponent,
  GridComponent,
  DataZoomComponent,
} from 'echarts/components';
import dayjs from 'dayjs';

import config from '@/config';

use([
  CanvasRenderer,
  LineChart,
  TooltipComponent,
  // LegendComponent,
  GridComponent,
  DataZoomComponent,
]);

export default (
  cateList,
  dateList,
  valueList,
  mode = 'dark',
) => {
  const fontFamily = config.nazhua.disableSarasaTermSC === true ? undefined : 'Sarasa Term SC';
  const option = {
    darkMode: mode === 'dark',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params) => {
        const time = dayjs(parseInt(params[0].axisValue, 10)).format('YYYY.MM.DD HH:mm');
        let res = `${time}<br>`;
        params.forEach((i) => {
          res += `${i.marker} ${i.seriesName}: ${i.value[1]}ms<br>`;
        });
        return res;
      },
      backgroundColor: mode === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      borderColor: mode === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      textStyle: {
        color: mode === 'dark' ? '#ddd' : '#222',
        fontFamily: 'Sarasa Term SC',
        fontSize: 14,
      },
    },
    // legend: {
    //   show: false,
    //   data: cateList.map((i) => ({
    //     name: i.name,
    //     itemStyle: {
    //       color: i.color,
    //     },
    //     lineStyle: {
    //       color: i.color,
    //     },
    //   })),
    //   textStyle: {
    //     color: mode === 'dark' ? '#ddd' : '#222',
    //     fontFamily,
    //     fontSize: 14,
    //   },
    // },
    grid: {
      top: 10,
      left: 5,
      right: 5,
      bottom: 50,
      containLabel: true,
    },
    dataZoom: [{
      id: 'dataZoomX',
      type: 'slider',
      xAxisIndex: [0],
      filterMode: 'none',
    }],
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.4)',
        },
      },
      axisLabel: {
        fontFamily,
        color: mode === 'dark' ? '#ddd' : '#222',
        fontSize: 12,
      },
    },
    xAxis: {
      type: 'time',
      data: dateList,
      axisLabel: {
        hideOverlap: true,
        nameTextStyle: {
          fontSize: 12,
        },
        fontFamily,
        color: mode === 'dark' ? '#eee' : '#222',
      },
    },
    series: valueList.map((i) => ({
      ...i,
      type: 'line',
      smooth: true,
      connectNulls: true,
      legendHoverLink: false,
      symbol: 'none',
    })),
  };
  return option;
};
