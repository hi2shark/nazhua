import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components';
import dayjs from 'dayjs';

use([
  CanvasRenderer,
  LineChart,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

export default (
  cateList,
  dateList,
  valueList,
  mode = 'dark',
) => {
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params) => {
        const time = dayjs(parseInt(params[0].axisValue, 10)).format('YYYY.MM.DD HH:mm');
        let res = `${time}<br>`;
        params.forEach((i) => {
          res += `${i.marker} ${i.seriesName}: ${i.value}ms<br>`;
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
    legend: {
      top: 5,
      data: cateList,
      textStyle: {
        color: mode === 'dark' ? '#ddd' : '#222',
        fontFamily: 'Sarasa Term SC',
        fontSize: 14,
      },
    },
    xAxis: {
      type: 'category',
      data: dateList,
      axisLabel: {
        hideOverlap: true,
        interval: Math.max(
          Math.ceil(dateList.length / 12),
          1,
        ),
        nameTextStyle: {
          fontSize: 12,
        },
        formatter: (val) => dayjs(parseInt(val, 10)).format('HH:mm'),
        fontFamily: 'Sarasa Term SC',
        color: mode === 'dark' ? '#eee' : '#222',
      },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.4)',
        },
      },
      axisLabel: {
        fontFamily: 'Sarasa Term SC',
        color: mode === 'dark' ? '#ddd' : '#222',
        fontSize: 12,
      },
    },
    grid: {
      left: 0,
      right: 0,
      bottom: 0,
      containLabel: true,
    },
    series: valueList.map((i) => ({
      type: 'line',
      data: i.data,
      name: i.name,
      smooth: true,
      connectNulls: true,
      legendHoverLink: false,
      symbol: 'none',
    })),
  };
  return option;
};
