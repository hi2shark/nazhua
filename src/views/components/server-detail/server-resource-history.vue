<template>
  <dot-dot-box
    v-if="isModuleVisible"
    padding="16px 20px"
    class="server-resource-history"
  >
    <div class="module-head-group">
      <div class="left-box">
        <span class="module-title">
          资源历史
        </span>
      </div>
      <div class="right-box">
        <div class="last-update-time-group">
          <span class="last-update-time-label">
            最近
          </span>
          <div class="minutes">
            <div
              v-for="periodItem in availablePeriods"
              :key="periodItem.value"
              class="minute-item"
              :class="{
                active: periodItem.value === period,
              }"
              @click="setPeriod(periodItem.value)"
            >
              <span>{{ periodItem.label }}</span>
            </div>
            <div
              class="active-arrow"
              :style="periodActiveArrowStyle"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="history-grid">
      <article
        v-for="card in historyCards"
        :key="card.key"
        class="history-card"
      >
        <div class="history-card__head">
          <h3 class="history-card__title">
            {{ card.title }}
          </h3>
          <div class="history-card__meta">
            <template v-if="card.headMode === 'summary'">
              <span class="history-card__summary">
                {{ card.summaryValue }}
              </span>
              <span
                v-if="card.summaryDetail"
                class="history-card__summary-detail"
              >
                {{ card.summaryDetail }}
              </span>
            </template>

            <div
              v-else
              class="history-card__metrics"
            >
              <div
                v-for="metricRow in card.metricRows"
                :key="`${card.key}_${metricRow.key}`"
                class="monitor-cate-item"
                :class="{ 'is-muted': metricRow.muted }"
                :style="{ '--cate-color': metricRow.color }"
              >
                <span class="cate-legend" />
                <span class="cate-name">{{ metricRow.label }}</span>
                <span
                  v-if="metricRow.detail"
                  class="cate-detail"
                >
                  {{ metricRow.detail }}
                </span>
                <span class="cate-value">{{ metricRow.value }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="history-card__chart-shell">
          <line-chart
            v-if="card.hasData"
            :date-list="card.dateList"
            :value-list="card.valueList"
            :connect-nulls="false"
            :chart-config="card.chartConfig"
            :mode="chartMode"
            :size="240"
          />
          <div
            v-else-if="!isLoading"
            class="history-card__empty"
          >
            暂无历史数据
          </div>
          <div
            v-if="isLoading"
            class="history-card__loading"
          >
            <span>加载中...</span>
          </div>
        </div>
      </article>
    </div>
  </dot-dot-box>
</template>

<script setup>
/* eslint-disable no-use-before-define */
import {
  computed,
  onUnmounted,
  ref,
  watch,
} from 'vue';
import { useStore } from 'vuex';
import config from '@/config';
import request from '@/utils/request';
import { hasTsdb, isTsdbEnabled } from '@/utils/tsdb';
import LineChart from '@/components/charts/line.vue';
import DotDotBox from '@/components/dot-dot-box.vue';

const props = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
});

const RESOURCE_HISTORY_PERIOD_KEY = 'nazhua_resource_history_period';
const NO_SWAP_TEXT = 'no swap';
const METRIC_KEYS = [
  'cpu',
  'memory',
  'swap',
  'disk',
  'process_count',
  'net_in_speed',
  'net_out_speed',
  'tcp_conn',
  'udp_conn',
];
const PERIOD_OPTIONS = [{
  label: '30分钟',
  value: 30,
  apiPeriod: '1d',
}, {
  label: '1小时',
  value: 60,
  apiPeriod: '1d',
}, {
  label: '3小时',
  value: 180,
  apiPeriod: '1d',
}, {
  label: '6小时',
  value: 360,
  apiPeriod: '1d',
}, {
  label: '12小时',
  value: 720,
  apiPeriod: '1d',
}, {
  label: '24小时',
  value: 1440,
  apiPeriod: '1d',
}, {
  label: '7天',
  value: 10080,
  apiPeriod: '7d',
}, {
  label: '30天',
  value: 43200,
  apiPeriod: '30d',
}];
const SERIES_COLORS = {
  cpu: '#4e90ff',
  memory: '#27c975',
  swap: '#f59e0b',
  disk: '#22d3ee',
  process_count: '#f5b199',
  net_in_speed: '#f5b199',
  net_out_speed: '#89c3eb',
  tcp_conn: '#89c3eb',
  udp_conn: '#4e90ff',
};

const store = useStore();
const chartMode = computed(() => (config.nazhua.lightBackground ? 'light' : 'dark'));
const userLogin = computed(() => store.state.profile?.username);
const serverId = computed(() => props.info?.ID);
const tsdbEnabled = computed(() => isTsdbEnabled(store));
const canUseLongPeriods = computed(() => !!userLogin.value && hasTsdb(store));
const nowServerTime = computed(() => store.state.serverTime || Date.now());
const acceptShowTime = computed(() => {
  const minutes = period.value;
  if (!minutes || minutes <= 0) {
    return 0;
  }
  return (Math.floor(nowServerTime.value / 60000) - minutes) * 60000;
});
const availablePeriods = computed(() => PERIOD_OPTIONS.filter((item) => {
  if (item.value <= 1440) return true;
  return canUseLongPeriods.value;
}));
const periodActiveArrowStyle = computed(() => {
  const index = availablePeriods.value.findIndex((item) => item.value === period.value);
  return {
    left: `calc(${Math.max(index, 0)} * var(--minute-item-width))`,
  };
});
const isSupported = computed(() => config.nazhua.nezhaVersion === 'v1' && tsdbEnabled.value);
const period = ref(readStoredPeriod());
const metricHistory = ref(createEmptyMetricMap());
const isLoading = ref(false);

let loadMetricsTimer = null;
let requestSerial = 0;
let currentAbortController = null;

const historyCards = computed(() => {
  const hasSwap = props.info?.Host?.SwapTotal > 0;
  const memSwapSeries = buildAlignedSeries([{
    metric: 'memory',
    name: '内存',
    color: SERIES_COLORS.memory,
  }, {
    metric: 'swap',
    name: '交换',
    color: SERIES_COLORS.swap,
  }]);
  const netSpeedSeries = buildAlignedSeries([{
    metric: 'net_in_speed',
    name: '上传',
    color: SERIES_COLORS.net_in_speed,
  }, {
    metric: 'net_out_speed',
    name: '下载',
    color: SERIES_COLORS.net_out_speed,
  }]);
  const connSeries = buildAlignedSeries([{
    metric: 'tcp_conn',
    name: 'TCP',
    color: SERIES_COLORS.tcp_conn,
  }, {
    metric: 'udp_conn',
    name: 'UDP',
    color: SERIES_COLORS.udp_conn,
  }]);
  const cpuSeries = buildAlignedSeries([{
    metric: 'cpu',
    name: 'CPU',
    color: SERIES_COLORS.cpu,
  }]);
  const diskSeries = buildAlignedSeries([{
    metric: 'disk',
    name: '磁盘',
    color: SERIES_COLORS.disk,
  }]);
  const processSeries = buildAlignedSeries([{
    metric: 'process_count',
    name: '进程',
    color: SERIES_COLORS.process_count,
  }]);

  const currentCpu = firstFinite(props.info?.State?.CPU, latestMetricValue('cpu'));
  const currentMemPercent = firstFinite(
    calcPercent(props.info?.State?.MemUsed, props.info?.Host?.MemTotal),
    latestMetricValue('memory'),
  );
  const currentSwapPercent = hasSwap
    ? firstFinite(
      calcPercent(props.info?.State?.SwapUsed, props.info?.Host?.SwapTotal),
      latestMetricValue('swap'),
    )
    : null;
  const currentDiskPercent = firstFinite(
    calcPercent(props.info?.State?.DiskUsed, props.info?.Host?.DiskTotal),
    latestMetricValue('disk'),
  );
  const currentProcessCount = firstFinite(
    props.info?.State?.ProcessCount,
    latestMetricValue('process_count'),
  );
  const currentNetInSpeed = firstFinite(
    props.info?.State?.NetInSpeed,
    latestMetricValue('net_in_speed'),
  );
  const currentNetOutSpeed = firstFinite(
    props.info?.State?.NetOutSpeed,
    latestMetricValue('net_out_speed'),
  );
  const currentTcpCount = firstFinite(
    props.info?.State?.TcpConnCount,
    latestMetricValue('tcp_conn'),
  );
  const currentUdpCount = firstFinite(
    props.info?.State?.UdpConnCount,
    latestMetricValue('udp_conn'),
  );

  return [createSummaryCard({
    key: 'cpu',
    title: 'CPU',
    summaryValue: formatPercent(currentCpu),
    series: cpuSeries,
    chartConfig: getPercentChartConfig(),
  }), createMetricCard({
    key: 'memory_swap',
    title: '内存 / 交换',
    metricRows: [
      createMetricRow({
        key: 'memory',
        label: '内存',
        value: formatPercent(currentMemPercent),
        detail: formatBinaryRatio(props.info?.State?.MemUsed, props.info?.Host?.MemTotal),
        color: SERIES_COLORS.memory,
      }),
      createMetricRow({
        key: 'swap',
        label: '交换',
        value: hasSwap ? formatPercent(currentSwapPercent) : NO_SWAP_TEXT,
        detail: hasSwap
          ? formatBinaryRatio(props.info?.State?.SwapUsed, props.info?.Host?.SwapTotal)
          : '',
        color: SERIES_COLORS.swap,
        muted: !hasSwap,
      }),
    ],
    series: memSwapSeries,
    chartConfig: getPercentChartConfig(),
  }), createSummaryCard({
    key: 'disk',
    title: '磁盘',
    summaryValue: formatPercent(currentDiskPercent),
    summaryDetail: formatBinaryRatio(props.info?.State?.DiskUsed, props.info?.Host?.DiskTotal),
    series: diskSeries,
    chartConfig: getPercentChartConfig(),
  }), createSummaryCard({
    key: 'process_count',
    title: '进程数',
    summaryValue: formatCount(currentProcessCount),
    series: processSeries,
    chartConfig: getCountChartConfig(),
  }), createMetricCard({
    key: 'net_speed',
    title: '上传 / 下载',
    metricRows: [
      createMetricRow({
        key: 'net_in_speed',
        label: '上传',
        value: formatSpeedText(currentNetInSpeed),
        color: SERIES_COLORS.net_in_speed,
      }),
      createMetricRow({
        key: 'net_out_speed',
        label: '下载',
        value: formatSpeedText(currentNetOutSpeed),
        color: SERIES_COLORS.net_out_speed,
      }),
    ],
    series: netSpeedSeries,
    chartConfig: getSpeedChartConfig(),
  }), createMetricCard({
    key: 'connections',
    title: 'TCP / UDP',
    metricRows: [
      createMetricRow({
        key: 'tcp_conn',
        label: 'TCP',
        value: formatCount(currentTcpCount),
        color: SERIES_COLORS.tcp_conn,
      }),
      createMetricRow({
        key: 'udp_conn',
        label: 'UDP',
        value: formatCount(currentUdpCount),
        color: SERIES_COLORS.udp_conn,
      }),
    ],
    series: connSeries,
    chartConfig: getCountChartConfig(),
  })];
});

const hasRenderableData = computed(() => historyCards.value.some((card) => card.hasData));
const isModuleVisible = computed(() => isSupported.value && hasRenderableData.value);

watch(availablePeriods, (options) => {
  if (options.some((item) => item.value === period.value)) {
    return;
  }
  period.value = options[0]?.value || '1d';
}, {
  immediate: true,
});

watch(period, (value) => {
  writeStoredPeriod(value);
});

watch(
  [serverId, period, isSupported],
  ([nextServerId, nextPeriod, supported]) => {
    clearLoadTimer();
    abortCurrentLoad();
    if (!supported || !nextServerId || !nextPeriod) {
      requestSerial += 1;
      metricHistory.value = createEmptyMetricMap();
      isLoading.value = false;
      return;
    }
    loadMetrics();
  },
  { immediate: true },
);

onUnmounted(() => {
  clearLoadTimer();
  abortCurrentLoad();
});

function abortCurrentLoad() {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }
}

function setPeriod(value) {
  if (value === period.value) {
    return;
  }
  period.value = value;
}

function readStoredPeriod() {
  if (typeof window === 'undefined') {
    return 1440;
  }
  const storedValue = window.localStorage.getItem(RESOURCE_HISTORY_PERIOD_KEY);
  const storedMinutes = parseInt(storedValue, 10);
  if (Number.isNaN(storedMinutes)) {
    return 1440;
  }
  return PERIOD_OPTIONS.some((item) => item.value === storedMinutes) ? storedMinutes : 1440;
}

function writeStoredPeriod(value) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(RESOURCE_HISTORY_PERIOD_KEY, String(value));
}

function clearLoadTimer() {
  if (loadMetricsTimer) {
    window.clearTimeout(loadMetricsTimer);
    loadMetricsTimer = null;
  }
}

function scheduleAutoRefresh() {
  clearLoadTimer();
  if (!isSupported.value || !serverId.value || !period.value || period.value > 1440) {
    return;
  }
  let refreshSeconds = parseInt(config.nazhua.monitorRefreshTime, 10);
  if (Number.isNaN(refreshSeconds)) {
    refreshSeconds = 30;
  }
  if (refreshSeconds <= 0) {
    return;
  }
  loadMetricsTimer = window.setTimeout(() => {
    loadMetrics(false);
  }, Math.max(refreshSeconds, 10) * 1000);
}

async function loadMetrics(showLoading = true) {
  const currentServerId = serverId.value;
  if (!currentServerId) {
    metricHistory.value = createEmptyMetricMap();
    if (showLoading) {
      isLoading.value = false;
    }
    return;
  }

  const serial = requestSerial + 1;
  requestSerial = serial;

  abortCurrentLoad();
  const abortController = new AbortController();
  currentAbortController = abortController;
  if (showLoading) {
    isLoading.value = true;
  }

  try {
    const periodOption = PERIOD_OPTIONS.find((item) => item.value === period.value);
    const apiPeriod = periodOption?.apiPeriod || '1d';
    const metricEntries = await Promise.all(METRIC_KEYS.map(async (metricKey) => {
      const history = await loadMetricHistory(
        currentServerId,
        metricKey,
        apiPeriod,
        abortController,
      );
      return [metricKey, normalizeMetricHistory(metricKey, history)];
    }));

    if (serial !== requestSerial) {
      return;
    }

    metricHistory.value = Object.fromEntries(metricEntries);
  } catch (error) {
    if (serial === requestSerial) {
      console.error('Failed to load resource history:', error);
    }
  } finally {
    if (serial === requestSerial) {
      if (showLoading) {
        isLoading.value = false;
      }
      currentAbortController = null;
      scheduleAutoRefresh();
    }
  }
}

async function loadMetricHistory(id, metricKey, apiPeriod, abortController) {
  const baseUrl = config.nazhua.v1ApiMetricsPath.replace('{id}', id);
  const query = new URLSearchParams({
    metric: metricKey,
    period: apiPeriod,
  }).toString();
  const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${query}`;
  const res = await request({
    url,
    type: 'GET',
    controller: {
      abortController,
    },
  });
  if (res?.status !== 200 || !res?.data?.success) {
    return [];
  }
  const data = res.data?.data || {};
  const dataPoints = data?.data_points || data?.dataPoints || data?.DataPoints;
  return Array.isArray(dataPoints) ? dataPoints : [];
}

function normalizeMetricHistory(metricKey, history) {
  const minTs = acceptShowTime.value || 0;
  return history
    .map((item) => normalizeMetricPoint(metricKey, item))
    .filter((item) => item && Number.isFinite(item.ts) && Number.isFinite(item.value))
    .filter((item) => item.ts >= minTs)
    .sort((a, b) => a.ts - b.ts);
}

function normalizeMetricPoint(metricKey, point) {
  const ts = Number(point?.ts ?? point?.timestamp ?? point?.time);
  let value = Number(point?.value ?? point?.avg ?? point?.usage);
  if (!Number.isFinite(ts) || !Number.isFinite(value)) {
    return null;
  }

  switch (metricKey) {
    case 'memory':
      value = normalizeUsageValue(value, props.info?.Host?.MemTotal);
      break;
    case 'swap':
      value = normalizeUsageValue(value, props.info?.Host?.SwapTotal);
      break;
    case 'disk':
      value = normalizeUsageValue(value, props.info?.Host?.DiskTotal);
      break;
    default:
      break;
  }

  return Number.isFinite(value) ? {
    ts,
    value,
  } : null;
}

function normalizeUsageValue(value, total) {
  if (!Number.isFinite(value)) {
    return null;
  }
  if (value <= 100) {
    return value;
  }
  return calcPercent(value, total);
}

function buildAlignedSeries(seriesDefs) {
  const timestampSet = new Set();
  const metricMaps = {};

  seriesDefs.forEach((seriesDef) => {
    const metricItems = metricHistory.value[seriesDef.metric] || [];
    metricMaps[seriesDef.metric] = new Map();
    metricItems.forEach((item) => {
      timestampSet.add(item.ts);
      metricMaps[seriesDef.metric].set(item.ts, item.value);
    });
  });

  const dateList = Array.from(timestampSet).sort((a, b) => a - b);
  const valueList = seriesDefs.map((seriesDef) => ({
    id: seriesDef.metric,
    name: seriesDef.name,
    data: dateList.map((timestamp) => [
      timestamp,
      metricMaps[seriesDef.metric].has(timestamp)
        ? metricMaps[seriesDef.metric].get(timestamp)
        : null,
    ]),
    itemStyle: {
      color: seriesDef.color,
    },
    lineStyle: {
      color: seriesDef.color,
    },
  }));

  const hasData = valueList.some((seriesItem) => seriesItem.data.some(([, value]) => value !== null));

  return {
    dateList,
    valueList,
    hasData,
  };
}

function latestMetricValue(metricKey) {
  const history = metricHistory.value[metricKey] || [];
  if (!history.length) {
    return null;
  }
  return history[history.length - 1]?.value ?? null;
}

function calcPercent(usedRaw, totalRaw) {
  const used = Number(usedRaw);
  const total = Number(totalRaw);
  if (!Number.isFinite(used) || !Number.isFinite(total) || total <= 0) {
    return null;
  }
  return Number(((used / total) * 100).toFixed(4));
}

function firstFinite(...values) {
  for (let index = 0; index < values.length; index += 1) {
    const value = Number(values[index]);
    if (Number.isFinite(value)) {
      return value;
    }
  }
  return null;
}

function formatPercent(value) {
  return value == null ? '-' : `${formatCompactNumber(value)}%`;
}

function formatCount(value) {
  return value == null ? '-' : `${Math.round(Number(value))}`;
}

function createSummaryCard({
  key,
  title,
  summaryValue,
  summaryDetail = '',
  series,
  chartConfig,
}) {
  return {
    key,
    title,
    headMode: 'summary',
    summaryValue,
    summaryDetail,
    metricRows: [],
    ...series,
    chartConfig,
  };
}

function createMetricCard({
  key,
  title,
  metricRows,
  series,
  chartConfig,
}) {
  return {
    key,
    title,
    headMode: 'metrics',
    summaryValue: '',
    summaryDetail: '',
    metricRows,
    ...series,
    chartConfig,
  };
}

function createMetricRow({
  key,
  label,
  value,
  detail = '',
  color,
  muted = false,
}) {
  return {
    key,
    label,
    value,
    detail,
    color,
    muted,
  };
}

function formatCompactNumber(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return '-';
  }
  const absValue = Math.abs(numericValue);
  if (absValue >= 100 || Number.isInteger(numericValue)) {
    return `${Number(numericValue.toFixed(0))}`;
  }
  if (absValue >= 10) {
    return `${Number(numericValue.toFixed(1))}`;
  }
  return `${Number(numericValue.toFixed(2))}`;
}

function formatBinaryText(bytes, options = {}) {
  const parts = formatBinaryParts(bytes, options);
  if (parts.value === '-') {
    return '-';
  }
  return `${parts.value}${parts.unit}`;
}

function formatSpeedText(bytes) {
  if (bytes == null) {
    return '-';
  }
  return formatBinaryText(bytes, { perSecond: true });
}

function formatBinaryRatio(usedBytes, totalBytes) {
  const usedText = formatBinaryText(usedBytes);
  const totalText = formatBinaryText(totalBytes);
  if (usedText === '-' && totalText === '-') {
    return '-';
  }
  return `${usedText} / ${totalText}`;
}

function formatBinaryParts(bytes, options = {}) {
  const {
    perSecond = false,
  } = options;
  const numericBytes = Number(bytes);
  if (!Number.isFinite(numericBytes) || numericBytes < 0) {
    return {
      value: '-',
      unit: '',
    };
  }

  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
  let unitIndex = 0;
  let resultValue = numericBytes;

  while (resultValue >= 1024 && unitIndex < units.length - 1) {
    resultValue /= 1024;
    unitIndex += 1;
  }

  let digits;
  if (resultValue >= 100) {
    digits = 0;
  } else if (resultValue >= 10) {
    digits = 1;
  } else {
    digits = 2;
  }

  return {
    value: `${Number(resultValue.toFixed(digits))}`,
    unit: `${units[unitIndex]}${perSecond ? '/s' : ''}`,
  };
}

function getXAxisConfig() {
  const minutes = period.value || 1440;
  let intervalMinutes = 5;
  if (minutes > 60 && minutes <= 180) {
    intervalMinutes = 15;
  } else if (minutes <= 360) {
    intervalMinutes = 30;
  } else if (minutes <= 720) {
    intervalMinutes = 60;
  } else if (minutes <= 1440) {
    intervalMinutes = 120;
  } else if (minutes <= 10080) {
    intervalMinutes = 720;
  } else {
    intervalMinutes = 1440;
  }
  return {
    minInterval: intervalMinutes * 60 * 1000,
  };
}

function getPercentChartConfig() {
  return {
    showDataZoom: false,
    grid: {
      top: 10,
      left: 2,
      right: 6,
      bottom: 20,
    },
    xAxis: getXAxisConfig(),
    yAxis: {
      min: 0,
      max: 100,
      formatter: (value) => `${value}%`,
    },
    tooltip: {
      valueFormatter: (value) => formatPercent(value),
    },
    series: {
      lineWidth: 1.6,
      areaOpacity: 1,
      areaAlpha: 0.08,
    },
  };
}

function getCountChartConfig() {
  return {
    showDataZoom: false,
    grid: {
      top: 10,
      left: 2,
      right: 6,
      bottom: 20,
    },
    xAxis: getXAxisConfig(),
    yAxis: {
      min: 0,
      formatter: (value) => `${Math.round(value)}`,
    },
    tooltip: {
      valueFormatter: (value) => formatCount(value),
    },
    series: {
      lineWidth: 1.6,
      areaOpacity: 1,
      areaAlpha: 0.08,
    },
  };
}

function getSpeedChartConfig() {
  return {
    showDataZoom: false,
    grid: {
      top: 10,
      left: 2,
      right: 6,
      bottom: 20,
    },
    xAxis: getXAxisConfig(),
    yAxis: {
      min: 0,
      formatter: (value) => formatBinaryText(value, { perSecond: true }),
    },
    tooltip: {
      valueFormatter: (value) => formatSpeedText(value),
    },
    series: {
      lineWidth: 1.6,
      areaOpacity: 1,
      areaAlpha: 0.08,
    },
  };
}

function createEmptyMetricMap() {
  return Object.fromEntries(METRIC_KEYS.map((metricKey) => [metricKey, []]));
}
</script>
<style lang="scss" scoped>
.server-resource-history {
  --line-chart-size: 240px;

  :deep(.line-box) {
    height: 100%;
    min-height: 0;
  }

  :deep(.chart) {
    border-radius: inherit;
  }
}

.module-head-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;

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
}

.last-update-time-group {
  --minute-item-width: 54px;
  --minute-item-height: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;

  .last-update-time-label {
    flex: 0 0 auto;
    color: #ddd;
    height: var(--minute-item-height);
    line-height: var(--minute-item-height);
    font-size: 12px;
  }

  @media screen and (max-width: 400px) {
    --minute-item-width: 48px;

    .last-update-time-label {
      display: none;
    }
  }
}

.minutes {
  position: relative;
  display: flex;
  align-items: center;
  height: var(--minute-item-height);
  max-width: 100%;
  background: rgba(#fff, 0.2);
  border-radius: calc(var(--minute-item-height) / 2);
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }

  .minute-item {
    position: relative;
    z-index: 10;
    flex: 0 0 auto;
    width: var(--minute-item-width);
    height: var(--minute-item-height);
    line-height: var(--minute-item-height);
    font-size: 11px;
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
    transition: left 0.3s;
    z-index: 1;
  }
}

.history-grid {
  display: grid;
  gap: 10px 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.history-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.history-card__head {
  --head-height: 24px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
}

.history-card__title {
  flex: 0 1 auto;
  margin: 0;
  min-width: 0;
  height: var(--head-height);
  line-height: var(--head-height);
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #eee;
}

.history-card__meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-width: 0;
  height: var(--head-height);
}

.history-card__summary {
  height: var(--head-height);
  line-height: var(--head-height);
  color: #fff;
  font-family: var(--font-mono, 'Sarasa Term SC', monospace);
  font-size: 17px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.history-card__summary-detail {
  height: var(--head-height);
  line-height: var(--head-height);
  color: #aaa;
  font-size: 11px;
  font-family: var(--font-mono, 'Sarasa Term SC', monospace);
  white-space: nowrap;
}

.history-card__metrics {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  min-width: 0;
  height: var(--head-height);
}

.monitor-cate-item {
  --cate-item-height: var(--head-height);
  --cate-color: #fff;

  display: flex;
  align-items: center;
  height: var(--cate-item-height);
  gap: 6px;
  padding: 0 6px;
  font-size: 13px;
  border-radius: 4px;
  min-width: 0;

  &.is-muted {
    opacity: 0.6;
  }

  .cate-legend {
    flex-shrink: 0;
    width: 0.5em;
    height: 0.5em;
    background: var(--cate-color);
  }

  .cate-name {
    flex-shrink: 0;
    height: var(--cate-item-height);
    line-height: var(--cate-item-height);
    color: #eee;
  }

  .cate-detail {
    flex: 1 1 auto;
    min-width: 0;
    height: var(--cate-item-height);
    line-height: var(--cate-item-height);
    color: #aaa;
    font-size: 11px;
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cate-value {
    flex-shrink: 0;
    height: var(--cate-item-height);
    line-height: var(--cate-item-height);
    text-align: right;
    color: #fff;
    font-weight: 600;
  }
}

.history-card__chart-shell {
  position: relative;
  display: flex;
  align-items: stretch;
  height: var(--line-chart-size);
  min-height: 0;
  border-radius: 8px;
  border: 1px solid rgba(#fff, 0.08);
  background: rgba(#fff, 0.02);
  overflow: hidden;
}

.history-card__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  color: #aaa;
  font-size: 12px;
  text-align: center;
}

.history-card__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: inherit;
  background: rgba(#000, 0.35);
  backdrop-filter: blur(1px);
  pointer-events: none;
  z-index: 10;

  span {
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(#000, 0.5);
    color: #ddd;
    font-size: 12px;
  }
}

@media screen and (max-width: 768px) {
  .history-grid {
    gap: 10px 0;
    grid-template-columns: 1fr;
  }

  .history-card__title {
    font-size: 14px;
  }

  .history-card__summary {
    font-size: 15px;
  }

  .monitor-cate-item {
    --cate-item-height: 22px;

    font-size: 12px;

    .cate-detail {
      display: none;
    }
  }

  .history-card__chart-shell {
    height: 200px;
  }
}
</style>
