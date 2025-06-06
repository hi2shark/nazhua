<template>
  <dot-dot-box
    v-if="monitorData.length"
    class="server-monitor-group"
    :class="{
      'chart-type--multi': config.nazhua.monitorChartTypeToggle && monitorChartType === 'multi',
      'chart-type--single': config.nazhua.monitorChartTypeToggle && monitorChartType === 'single',
    }"
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
          v-if="config.nazhua.monitorChartTypeToggle"
          class="chart-type-switch-group"
          title="监控折线图是否聚合"
          @click="switchChartType"
        >
          <span class="label-text">聚合</span>
          <div
            class="switch-box"
            :class="{
              active: monitorChartType === 'multi',
            }"
          >
            <span class="switch-dot" />
          </div>
        </div>
        <div
          class="refresh-data-group"
          title="是否自动刷新"
          @click="switchRefresh"
        >
          <span class="label-text">刷新</span>
          <div
            class="switch-box"
            :class="{
              active: refreshData,
            }"
          >
            <span class="switch-dot" />
          </div>
        </div>
        <div
          class="peak-shaving-group"
          title="过滤太高或太低的数据"
          @click="switchPeakShaving"
        >
          <span class="label-text">削峰</span>
          <div
            class="switch-box"
            :class="{
              active: peakShaving,
            }"
          >
            <span class="switch-dot" />
          </div>
        </div>
        <div class="last-update-time-group">
          <span class="last-update-time-label">
            最近
          </span>
          <div class="minutes">
            <div
              v-for="minuteItem in minutes"
              :key="minuteItem.value"
              class="minute-item"
              :class="{
                active: minuteItem.value === minute,
              }"
              @click="toggleMinute(minuteItem.value)"
            >
              <span>{{ minuteItem.label }}</span>
            </div>
            <div
              class="active-arrow"
              :style="minuteActiveArrowStyle"
            />
          </div>
        </div>
      </div>
    </div>

    <template v-if="monitorChartType === 'single'">
      <div class="monitor-chart-group">
        <div
          v-for="(cateItem, index) in monitorChartData.cateList"
          :key="cateItem.id"
          class="monitor-chart-item"
        >
          <div class="cate-name-box">
            <popover :title="cateItem.title">
              <template #trigger>
                <div
                  class="monitor-cate-item"
                  :class="{
                    disabled: showCates[cateItem.id] === false,
                  }"
                  :style="{
                    '--cate-color': cateItem.color,
                  }"
                >
                  <span class="cate-legend" />
                  <span
                    class="cate-name"
                  >
                    {{ cateItem.name }}
                  </span>
                  <span
                    v-if="cateItem.avg !== 0"
                    class="cate-avg-ms"
                  >
                    {{ cateItem.avg }}ms
                  </span>
                  <span
                    v-else
                    class="cate-avg-ms"
                  >
                    -ms
                  </span>
                </div>
              </template>
            </popover>
          </div>
          <line-chart
            :date-list="monitorChartData.dateList"
            :value-list="[monitorChartData.valueList[index]]"
            :size="240"
          />
        </div>
      </div>
    </template>
    <template v-else>
      <div class="monitor-cate-group">
        <template
          v-for="cateItem in monitorChartData.cateList"
          :key="cateItem.id"
        >
          <popover :title="cateItem.title">
            <template #trigger>
              <div
                class="monitor-cate-item"
                :class="{
                  disabled: showCates[cateItem.id] === false,
                }"
                :style="{
                  '--cate-color': cateItem.color,
                }"
                @click="toggleShowCate(cateItem.id)"
                @touchstart="handleTouchStart(cateItem.id)"
                @touchend="handleTouchEnd(cateItem.id)"
                @touchmove="handleTouchMove(cateItem.id)"
              >
                <span class="cate-legend" />
                <span
                  class="cate-name"
                >
                  {{ cateItem.name }}
                </span>
                <span
                  v-if="cateItem.avg !== 0"
                  class="cate-avg-ms"
                >
                  {{ cateItem.avg }}ms
                </span>
                <span
                  v-else
                  class="cate-avg-ms"
                >
                  -ms
                </span>
              </div>
            </template>
          </popover>
        </template>
      </div>

      <line-chart
        :date-list="monitorChartData.dateList"
        :value-list="monitorChartData.valueList"
      />
    </template>
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
import { useStore } from 'vuex';
import config from '@/config';
import request from '@/utils/request';
import validate from '@/utils/validate';

import LineChart from '@/components/charts/line.vue';

import {
  getThreshold,
  getLineColor,
} from '@/views/composable/server-monitor';

const props = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
});

const store = useStore();

const minute = ref(1440);
const minutes = [{
  label: '30分钟',
  value: 30,
}, {
  label: '1小时',
  value: 60,
}, {
  label: '3小时',
  value: 180,
}, {
  label: '6小时',
  value: 360,
}, {
  label: '12小时',
  value: 720,
}, {
  label: '24小时',
  value: 1440,
}];
const localData = {
  peakShaving: window.localStorage.getItem('nazhua_monitor_peak_shaving'),
  refreshData: window.localStorage.getItem('nazhua_monitor_refresh_data'),
  chartType: window.localStorage.getItem('nazhua_monitor_chart_type'),
};
localData.peakShaving = validate.isSet(localData.peakShaving) ? localData.peakShaving === 'true' : false;
localData.refreshData = validate.isSet(localData.refreshData) ? localData.refreshData === 'true' : true;

const peakShaving = ref(localData.peakShaving);
const refreshData = ref(localData.refreshData);
const showCates = ref({});
const monitorData = ref([]);
const longPressTimer = ref(null);

const chartType = validate.isSet(localData.chartType)
  ? ref(localData.chartType)
  : ref(config.nazhua.monitorChartType === 'single' ? 'single' : 'multi');
const monitorChartType = computed(() => {
  if (config.nazhua.monitorChartTypeToggle) {
    return chartType.value;
  }
  return config.nazhua.monitorChartType;
});

const now = ref(Date.now());
const accpetShowTime = computed(() => now.value - (minute.value * 60 * 1000));

const minuteActiveArrowStyle = computed(() => {
  const index = minutes.findIndex((i) => i.value === minute.value);
  return {
    left: `calc(${index} * var(--minute-item-width))`,
  };
});

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
        id: i.monitor_id,
        dateMap,
        avgs: [],
      };
    }
    const showAvgDelay = [];
    const showCreateTime = i.created_at.filter((o, index) => {
      const status = o >= accpetShowTime.value;
      if (status) {
        showAvgDelay.push(i.avg_delay[index]);
      }
      return status;
    });
    const {
      threshold,
      mean,
      max,
      min,
    } = peakShaving.value ? getThreshold(showAvgDelay, 2) : {};
    showCreateTime.forEach((o, index) => {
      if (dateMap[o]) {
        return;
      }
      const avgDelay = showAvgDelay[index];
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
  let valueList = [];
  const cateList = [];
  Object.keys(cateMap).forEach((i) => {
    const {
      id,
      dateMap,
      avgs,
    } = cateMap[i];
    Object.entries(dateMap).forEach(([key, value]) => {
      const time = parseInt(key, 10);
      avgs.push([time, value]);
      dateList.push(time);
    });
    const color = getLineColor(id);
    if (avgs.length) {
      if (!validate.hasOwn(showCates.value, id)) {
        showCates.value[id] = true;
      }
      // 计算平均延迟和成功率
      const validAvgs = avgs.filter((a) => a[1] !== 0);
      const avg = validAvgs.reduce((a, b) => a + b[1], 0) / validAvgs.length;
      const over = avgs.filter((a) => a[1] !== 0).length / avgs.length;
      const cateItem = {
        id,
        name: i,
        color,
        avg: avg.toFixed(2) * 1,
        over: (over * 100).toFixed(2) * 1,
      };
      if (Number.isNaN(cateItem.avg)) {
        cateItem.avg = 0;
      }
      const titles = [
        cateItem.name,
        cateItem.avg === 0 ? '' : `平均延迟：${cateItem.avg}ms`,
        `成功率：${cateItem.over}%`,
      ];
      cateItem.title = titles.filter((s) => s).join('\n');
      cateList.push(cateItem);
      valueList.push({
        id,
        name: i,
        data: avgs,
        itemStyle: {
          color,
        },
        lineStyle: {
          color,
        },
      });
    }
  });
  // 去重
  dateList = Array.from(new Set(dateList)).sort((a, b) => a - b);
  valueList = valueList.filter((i) => showCates.value[i.id]);
  return {
    dateList,
    cateList,
    valueList,
  };
});

function switchPeakShaving() {
  peakShaving.value = !peakShaving.value;
  window.localStorage.setItem('nazhua_monitor_peak_shaving', peakShaving.value);
}

function switchRefresh() {
  refreshData.value = !refreshData.value;
  window.localStorage.setItem('nazhua_monitor_refresh_data', refreshData.value);
}

function switchChartType() {
  chartType.value = chartType.value === 'single' ? 'multi' : 'single';
  window.localStorage.setItem('nazhua_monitor_chart_type', chartType.value);
}

function toggleMinute(value) {
  now.value = store.state.serverTime || Date.now();
  minute.value = value;
}

function toggleShowCate(id) {
  if (window.innerWidth < 768) {
    return;
  }
  showCates.value[id] = !showCates.value[id];
}

function handleTouchStart(id) {
  longPressTimer.value = setTimeout(() => {
    showCates.value[id] = !showCates.value[id];
  }, 500);
}

function handleTouchEnd() {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value);
    longPressTimer.value = null;
  }
}

function handleTouchMove() {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value);
    longPressTimer.value = null;
  }
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
  now.value = store.state.serverTime || Date.now();
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
  --line-chart-size: 300px;

  &.chart-type--single {
    --line-chart-size: 240px;
  }

  .monitor-cate-item {
    --cate-item-height: 28px;
    --cate-item-font-size: 14px;
    --cate-color: #fff;

    display: flex;
    align-items: center;
    width: var(--cate-item-width);
    height: var(--cate-item-height);
    gap: 6px;
    padding: 0 6px;
    font-size: var(--cate-item-font-size);
    border-radius: 4px;
    cursor: pointer;

    @media screen and (max-width: 768px) {
      cursor: default;
    }

    .cate-legend {
      width: 0.5em;
      height: 0.5em;
      background: var(--cate-color);
    }

    .cate-name {
      // flex: 1;
      height: var(--cate-item-height);
      line-height: calc(var(--cate-item-height) + 2px);
      color: #eee;
    }

    .cate-avg-ms {
      height: var(--cate-item-height);
      line-height: calc(var(--cate-item-height) + 2px);
      text-align: right;
      color: #fff;
    }

    &.disabled {
      filter: grayscale(1);
      opacity: 0.5;
    }
  }
}

.module-head-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  .module-title {
    width: max-content;
    height: 30px;
    line-height: 30px;
    font-size: 16px;
    color: #eee;
  }

  .right-box {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
  }

  .peak-shaving-group,
  .refresh-data-group,
  .chart-type-switch-group {
    display: flex;
    align-items: center;
    gap: 4px;
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
          box-shadow: 1px 1px 2px rgba(#000, 0.4);
        }
      }
    }

    .label-text {
      color: #ddd;
      font-size: 12px;
    }
  }

  .last-update-time-group {
    --minute-item-width: 50px;
    --minute-item-height: 20px;
    display: flex;
    align-items: center;
    gap: 4px;

    .last-update-time-label {
      color: #ddd;
      height: var(--minute-item-height);
      line-height: var(--minute-item-height);
      font-size: 12px;
    }

    @media screen and (max-width: 660px) {
      --minute-item-width: 46px;
    }

    @media screen and (max-width: 600px) {
      --minute-item-width: 46px;
    }

    @media screen and (max-width: 400px) {
      .last-update-time-label {
        display: none;
      }
    }

    @media screen and (max-width: 330px) {
      margin-left: -12px;
    }

    @media screen and (max-width: 320px) {
      margin-left: -18px;
    }
  }
  .minutes {
    position: relative;
    display: flex;
    align-items: center;
    // padding: 0 10px;
    height: var(--minute-item-height);
    background: rgba(#fff, 0.2);
    border-radius: calc(var(--minute-item-height) / 2);

    .minute-item {
      position: relative;
      z-index: 10;
      width: var(--minute-item-width);
      height: var(--minute-item-height);
      line-height: var(--minute-item-height);
      font-size: 12px;
      text-align: center;
      cursor: pointer;
      color: #aaa;
      transition: color 0.3s;

      &.active {
        color: #fff;
        text-shadow: 1px 1px 2px rgba(#000, 0.6);
      }
    }

    .active-arrow {
      position: absolute;
      top: 0;
      left: 0;
      width: var(--minute-item-width);
      height: var(--minute-item-height);
      border-radius: calc(var(--minute-item-height) / 2);
      background: #4caf50;
      // opacity: 0.5;
      transition: left 0.3s;
      z-index: 1;
    }
  }
}

.monitor-cate-group {
  --gap-size: 0;
  margin: 10px 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap-size);
  margin-right: calc(var(--gap-size) * -1);
}

.monitor-chart-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 0;

  .monitor-chart-item {
    width: 50%;
    height: calc(var(--line-chart-size) + 28px);
  }

  @media screen and (max-width: 768px) {
    .monitor-chart-item {
      width: 100%;
    }
  }

  .cate-name-box {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
