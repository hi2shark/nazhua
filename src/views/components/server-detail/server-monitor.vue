<template>
  <dot-dot-box
    v-if="monitorData.length"
    class="server-monitor-group"
    padding="16px 20px"
  >
    <div class="module-head-group">
      <div class="left-box">
        <span class="module-title">
          网络监控
        </span>
      </div>
      <div class="right-box">
        <div
          class="peak-shaving-group"
          title="过滤太高或太低的数据"
          @click="switchPeakShaving"
        >
          <div
            class="switch-box"
            :class="{
              active: peakShaving,
            }"
          >
            <span class="switch-dot" />
          </div>
          <span class="label-text">削峰</span>
        </div>
      </div>
    </div>
    <line-chart
      :cate-list="monitorChartData.cateList"
      :date-list="monitorChartData.dateList"
      :value-list="monitorChartData.valueList"
    />
  </dot-dot-box>
</template>

<script setup>
/**
 * 服务器监控
 */
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
} from 'vue';
import config from '@/config';
import request from '@/utils/request';

import LineChart from '@/components/charts/line.vue';

import {
  getThreshold,
} from '@/views/composable/server-monitor';

const props = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
});

const peakShaving = ref(false);

const monitorData = ref([]);

const monitorChartData = computed(() => {
  const cateMap = {};
  const dateMap = {};
  monitorData.value.forEach((i) => {
    if (!cateMap[i.monitor_name]) {
      cateMap[i.monitor_name] = [];
    }
    const {
      threshold,
      mean,
      max,
      min,
    } = peakShaving.value ? getThreshold(i.avg_delay, 2) : {};
    i.created_at.forEach((o, index) => {
      if (!dateMap[o]) {
        dateMap[o] = [];
      }
      const avgDelay = i.avg_delay[index];
      if (peakShaving.value) {
        if (Math.abs(avgDelay - mean) > threshold && max / min > 2) {
          return;
        }
        if (avgDelay === 0) {
          return;
        }
      }
      dateMap[o].push({
        name: i.monitor_name,
        value: (avgDelay).toFixed(2) * 1,
      });
    });
  });
  const dateList = [];
  Object.keys(dateMap).forEach((i) => {
    if (dateMap[i]?.length) {
      const time = parseInt(i, 10);
      dateList.push(time);
      dateMap[i].forEach((o) => {
        cateMap[o.name].push([time, o.value]);
      });
    }
  });
  dateList.sort((a, b) => a - b);
  const cateList = [];
  const valueList = [];
  Object.keys(cateMap).forEach((i) => {
    if (cateMap[i]?.length) {
      cateList.push(i);
    }
    valueList.push({
      name: i,
      data: cateMap[i],
    });
  });
  return {
    cateList,
    dateList,
    valueList,
  };
});

function switchPeakShaving() {
  peakShaving.value = !peakShaving.value;
}

async function loadMonitor() {
  await request({
    url: (
      config.nazhua.nezhaVersion === 'v1' ? config.nazhua.v1ApiMonitorPath : config.nazhua.apiMonitorPath
    ).replace('{id}', props.info.ID),
  }).then((res) => {
    const list = config.nazhua.nezhaVersion === 'v1' ? res.data?.data : res.data?.result;
    if (Array.isArray(list)) {
      monitorData.value = list;
    }
  }).catch((err) => {
    console.error(err);
  });
}

let loadMonitorTimer = null;
async function setTimeLoadMonitor() {
  if (loadMonitorTimer) {
    clearTimeout(loadMonitorTimer);
  }
  await loadMonitor();
  let monitorRefreshTime = ((config.nazhua.monitorRefreshTime * 1) || 10);
  if (Number.isNaN(monitorRefreshTime)) {
    monitorRefreshTime = 10;
  }
  const sTime = Math.min(monitorRefreshTime, 10);
  loadMonitorTimer = setTimeout(() => {
    setTimeLoadMonitor();
  }, sTime * 1000);
}

onMounted(() => {
  setTimeLoadMonitor();
});

onUnmounted(() => {
  if (loadMonitorTimer) {
    clearTimeout(loadMonitorTimer);
  }
});
</script>

<style lang="scss" scoped>
.server-monitor-group {
  --line-chart-size: 280px;
}

.module-head-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  height: 30px;

  .module-title {
    line-height: 30px;
    font-size: 16px;
    color: #eee;
  }

  .peak-shaving-group {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;

    @media screen and (max-width: 1024px) {
      cursor: default;
    }

    .switch-box {
      position: relative;
      width: 30px;
      height: 16px;
      background: #999;
      border-radius: 10px;
      transition: backgroundColor 0.3s;

      .switch-dot {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 12px;
        height: 12px;
        background: #fff;
        border-radius: 50%;
        transition: left 0.3s;
      }

      &.active {
        background-color: #4caf50;

        .switch-dot {
          left: 16px;
        }
      }
    }

    .label-text {
      color: #ddd;
      font-size: 12px;
    }
  }
}
</style>
