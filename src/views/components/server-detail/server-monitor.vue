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
          class="refresh-data-group"
          title="是否自动刷新"
          @click="switchRefresh"
        >
          <div
            class="switch-box"
            :class="{
              active: refreshData,
            }"
          >
            <span class="switch-dot" />
          </div>
          <span class="label-text">刷新</span>
        </div>
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

const refreshData = ref(true);
const peakShaving = ref(false);

const monitorData = ref([]);

const monitorChartData = computed(() => {
  /**
   * 处理监控数据以生成分类的平均延迟随时间变化的列表。
   *
   * @returns {Object} 返回一个对象，包含：
   * - cateList {Array}: 唯一监控名称的列表。
   * - dateList {Array}: 排序后的唯一时间戳列表。
   * - valueList {Array}: 包含以下内容的对象列表：
   *   - name {String}: 监控名称。
   *   - data {Array}: [时间戳, 平均延迟] 对的数组。
   *
   * 该函数执行以下步骤：
   * 1. 遍历监控数据以分类和过滤平均延迟。
   * 2. 如果启用了削峰，则应用削峰以过滤异常值。
   * 3. 构建监控名称到其各自时间戳和平均延迟的映射。
   * 4. 将映射转换为监控名称、时间戳和平均延迟数据的列表。
   * 5. 删除重复的时间戳并对其进行排序。
   */
  const cateMap = {};
  monitorData.value.forEach((i) => {
    const dateMap = {};
    if (!cateMap[i.monitor_name]) {
      cateMap[i.monitor_name] = {
        dateMap,
        avgs: [],
      };
    }
    const {
      threshold,
      mean,
      max,
      min,
    } = peakShaving.value ? getThreshold(i.avg_delay, 2) : {};
    i.created_at.forEach((o, index) => {
      if (dateMap[o]) {
        return;
      }
      const avgDelay = i.avg_delay[index];
      if (peakShaving.value) {
        if (avgDelay === 0) {
          return;
        }
        if (Math.abs(avgDelay - mean) > threshold && max / min > 2) {
          return;
        }
      }
      dateMap[o] = (avgDelay).toFixed(2) * 1;
    });
  });
  let dateList = [];
  const cateList = [];
  const valueList = [];
  Object.keys(cateMap).forEach((i) => {
    const {
      dateMap,
      avgs,
    } = cateMap[i];
    Object.entries(dateMap).forEach(([key, value]) => {
      const time = parseInt(key, 10);
      avgs.push([time, value]);
      dateList.push(time);
    });
    valueList.push({
      name: i,
      data: avgs,
    });
    if (avgs.length) {
      cateList.push(i);
    }
  });
  // 去重
  dateList = Array.from(new Set(dateList)).sort((a, b) => a - b);
  return {
    dateList,
    cateList,
    valueList,
  };
});

function switchPeakShaving() {
  peakShaving.value = !peakShaving.value;
}

function switchRefresh() {
  refreshData.value = !refreshData.value;
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
async function setTimeLoadMonitor(force = false) {
  if (loadMonitorTimer) {
    clearTimeout(loadMonitorTimer);
  }
  if (refreshData.value || force) {
    await loadMonitor();
  }
  let monitorRefreshTime = parseInt(config.nazhua.monitorRefreshTime, 10);
  // 0 为不刷新
  if (monitorRefreshTime === 0) {
    return;
  }
  // 非数字 强制为30
  if (Number.isNaN(monitorRefreshTime)) {
    monitorRefreshTime = 30;
  }
  // 最小 10 秒
  const sTime = Math.min(monitorRefreshTime, 10);
  loadMonitorTimer = setTimeout(() => {
    setTimeLoadMonitor();
  }, sTime * 1000);
}

onMounted(() => {
  setTimeLoadMonitor(true);
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

  .right-box {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .peak-shaving-group,
  .refresh-data-group {
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
