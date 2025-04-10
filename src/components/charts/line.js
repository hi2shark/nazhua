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

export default (
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
        let res = `<p style="font-weight: bold; color: #ff6;">${time}</p>`;
        if (params.length < 10) {
          params.forEach((i) => {
            res += `${i.marker} ${i.seriesName}: ${i.value[1]}ms<br>`;
          });
        } else {
          res += '<table>';
          let trEnd = false;
          params.forEach((i, index) => {
            if (index % 2 === 0) {
              res += '<tr>';
            }
            res += `<td style="padding: 0 4px;">${i.marker} ${i.seriesName}: ${i.value[1]}ms</td>`;
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
      backgroundColor: mode === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      borderColor: mode === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      textStyle: {
        color: mode === 'dark' ? '#ddd' : '#222',
        fontFamily: 'Sarasa Term SC',
        fontSize: 14,
      },
    },
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
      filterMode: 'filter',
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
