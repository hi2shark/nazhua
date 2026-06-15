<template>
  <dot-dot-box
    v-if="showCard"
    class="server-cycle-transfer-group"
    padding="14px 18px"
  >
    <div class="module-head-group">
      <div class="left-box">
        <span class="module-title">周期流量</span>
        <span
          v-if="cycleTransferViewList.length > 1"
          class="rule-count"
        >
          {{ cycleTransferViewList.length }} 条规则
        </span>
      </div>
      <div class="right-box">
        <span
          v-if="refreshInterval > 0"
          class="refresh-tip"
        >
          <i class="ri-refresh-line" />
          {{ refreshInterval }}s 自动刷新
        </span>
      </div>
    </div>

    <div class="cycle-transfer-list">
      <div
        v-for="item in cycleTransferViewList"
        :key="`${item.source}_${item.ruleId}_${item.serverKey}`"
        class="cycle-transfer-item"
        :class="`status--${item.statusLevel}`"
      >
        <div class="cycle-transfer-item-head">
          <div class="rule-title-group">
            <span class="rule-name">{{ item.ruleName }}</span>
            <span
              class="rule-status"
              :class="`status--${item.statusLevel}`"
            >
              {{ item.statusLabel }}
            </span>
          </div>
          <span
            v-if="item.showProgress"
            class="remaining-percent"
          >
            剩余 {{ item.remainingPercentText }}
          </span>
        </div>

        <div class="cycle-transfer-meta">
          <span class="meta-item">周期 {{ item.periodText }}</span>
          <span class="meta-item">下次 {{ item.nextCheckDisplay }}</span>
        </div>

        <div class="cycle-transfer-stats">
          <span class="stats-item">
            <span class="stats-label">已用</span>
            <span class="stats-value">{{ item.currentUsageDisplay }}</span>
          </span>
          <span class="stats-item">
            <span class="stats-label">剩余</span>
            <span class="stats-value">{{ item.remainingDisplay }}</span>
          </span>
          <span class="stats-item">
            <span class="stats-label">上限</span>
            <span class="stats-value">{{ item.maxDisplay }}</span>
          </span>
          <span
            v-if="item.showMin"
            class="stats-item"
          >
            <span class="stats-label">下限</span>
            <span class="stats-value">{{ item.minDisplay }}</span>
          </span>
        </div>

        <div
          v-if="item.showProgress"
          class="progress-group"
        >
          <div class="progress-track">
            <div
              class="progress-bar"
              :class="`status--${item.statusLevel}`"
              :style="{
                width: `${item.progressWidth}%`,
              }"
            />
          </div>
          <div class="progress-text">
            {{ item.remainingDisplay }} / {{ item.remainingPercentText }}
          </div>
        </div>
      </div>
    </div>
  </dot-dot-box>
</template>

<script setup>
/**
 * 周期流量展示
 */
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
} from 'vue';
import config from '@/config';
import DotDotBox from '@/components/dot-dot-box.vue';
import {
  getCycleTransferStatusLabel,
  loadCycleTransferByServer,
} from '@/utils/cycle-transfer';

const props = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
});

const cycleTransferList = ref([]);

const refreshInterval = computed(() => {
  let value = parseInt(config.nazhua.detailCycleTransferRefreshTime, 10);
  if (Number.isNaN(value)) {
    value = 60;
  }
  return Math.max(value, 0);
});

const showCard = computed(() => {
  if (config.nazhua.hideDetailCycleTransfer) {
    return false;
  }
  return cycleTransferList.value.length > 0;
});

const cycleTransferViewList = computed(() => cycleTransferList.value.map((item) => ({
  ...item,
  statusLabel: getCycleTransferStatusLabel(item.statusLevel),
  showProgress: Number.isFinite(item.remainingPercent),
  progressWidth: Number.isFinite(item.remainingPercent) ? Math.max(Math.min(item.remainingPercent, 100), 0) : 0,
  remainingPercentText: Number.isFinite(item.remainingPercent) ? `${item.remainingPercent.toFixed(2)}%` : '-',
  periodText: `${item.periodStart} - ${item.periodEnd}`,
  showMin: item.minDisplay && item.minDisplay !== '0B' && item.minDisplay !== '-',
})));

async function loadCycleTransfer() {
  if (config.nazhua.hideDetailCycleTransfer || !props.info?.ID) {
    cycleTransferList.value = [];
    return;
  }

  try {
    const list = await loadCycleTransferByServer(props.info);
    cycleTransferList.value = Array.isArray(list) ? list : [];
  } catch (error) {
    cycleTransferList.value = [];
    console.error('Failed to load cycle transfer data:', error);
  }
}

let refreshTimer = null;

function clearRefreshTimer() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

function setCycleTransferRefreshTimer() {
  clearRefreshTimer();
  if (refreshInterval.value <= 0 || config.nazhua.hideDetailCycleTransfer) {
    return;
  }
  refreshTimer = setTimeout(async () => {
    await loadCycleTransfer();
    setCycleTransferRefreshTimer();
  }, refreshInterval.value * 1000);
}

onMounted(async () => {
  await loadCycleTransfer();
  setCycleTransferRefreshTimer();
});

onUnmounted(() => {
  clearRefreshTimer();
});
</script>

<style lang="scss" scoped>
.server-cycle-transfer-group {
  .module-head-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px 16px;
    margin-bottom: 12px;
  }

  .left-box,
  .right-box {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .left-box {
    gap: 8px;
  }

  .right-box {
    flex-shrink: 0;
  }

  .module-title {
    color: #f4f7fb;
    font-size: 15px;
    line-height: 1.5;
  }

  .rule-count {
    padding: 1px 7px;
    border: 1px solid rgba(#8bb3ff, 0.2);
    border-radius: 999px;
    color: #9fbcef;
    font-size: 12px;
    line-height: 17px;
    white-space: nowrap;
  }

  .refresh-tip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #9aa8b7;
    font-size: 12px;
    line-height: 1.5;
    white-space: nowrap;
  }

  .refresh-tip i {
    color: #89d6ff;
    font-size: 13px;
    line-height: 1;
  }

  .cycle-transfer-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .cycle-transfer-item {
    padding: 10px 12px 12px;
    border: 1px solid rgba(#fff, 0.1);
    border-radius: 8px;
    background: rgba(#000, 0.16);

    &.status--fine {
      border-color: rgba(#79ffbc, 0.18);
    }

    &.status--warning {
      border-color: rgba(#ffd166, 0.24);
    }

    &.status--alert {
      border-color: rgba(#ff9666, 0.26);
    }

    &.status--over {
      border-color: rgba(#ff7b8a, 0.28);
    }
  }

  .cycle-transfer-item-head,
  .cycle-transfer-meta,
  .cycle-transfer-stats {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 6px 12px;
  }

  .cycle-transfer-meta {
    margin-top: 7px;
  }

  .cycle-transfer-stats {
    justify-content: flex-start;
    margin-top: 8px;
  }

  .rule-title-group {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 7px;
    min-width: 0;
  }

  .rule-name {
    overflow: hidden;
    color: #f3f7fa;
    font-size: 14px;
    line-height: 1.4;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rule-status {
    padding: 1px 7px;
    border: 1px solid transparent;
    border-radius: 999px;
    font-size: 12px;
    line-height: 17px;
    white-space: nowrap;
  }

  .remaining-percent,
  .meta-item {
    color: #aeb8c2;
    font-size: 12px;
    line-height: 1.5;
  }

  .stats-item {
    display: inline-flex;
    align-items: baseline;
    gap: 4px;
    min-width: 0;
    color: #cdd7e1;
    font-size: 12px;
    line-height: 1.5;
  }

  .stats-label {
    color: #8e9cad;
    white-space: nowrap;
  }

  .stats-value {
    color: #e6edf4;
    white-space: nowrap;
  }

  .progress-group {
    margin-top: 8px;
  }

  .progress-track {
    height: 8px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(#fff, 0.1);
  }

  .progress-bar {
    height: 100%;
    border-radius: 999px;
    transition: width 0.3s ease;
  }

  .progress-text {
    margin-top: 5px;
    color: #d6deea;
    font-size: 12px;
    line-height: 1.5;
    text-align: right;
  }

  .status--fine {
    &.rule-status {
      color: #79ffbc;
      border-color: rgba(#79ffbc, 0.35);
      background: rgba(#79ffbc, 0.12);
    }

    &.progress-bar {
      background: linear-gradient(90deg, #2fc96f, #79ffbc);
    }
  }

  .status--warning {
    &.rule-status {
      color: #ffd166;
      border-color: rgba(#ffd166, 0.35);
      background: rgba(#ffd166, 0.12);
    }

    &.progress-bar {
      background: linear-gradient(90deg, #f9a826, #ffd166);
    }
  }

  .status--alert {
    &.rule-status {
      color: #ff9666;
      border-color: rgba(#ff9666, 0.35);
      background: rgba(#ff9666, 0.12);
    }

    &.progress-bar {
      background: linear-gradient(90deg, #ff7a45, #ff9666);
    }
  }

  .status--over {
    &.rule-status {
      color: #ff7b8a;
      border-color: rgba(#ff7b8a, 0.35);
      background: rgba(#ff7b8a, 0.12);
    }

    &.progress-bar {
      background: linear-gradient(90deg, #ff5468, #ff7b8a);
    }
  }

  .status--neutral {
    &.rule-status {
      color: #aeb8c2;
      border-color: rgba(#aeb8c2, 0.25);
      background: rgba(#aeb8c2, 0.08);
    }

    &.progress-bar {
      background: linear-gradient(90deg, #768595, #aeb8c2);
    }
  }

  @media screen and (max-width: 720px) {
    .module-head-group {
      align-items: flex-start;
      flex-direction: column;
    }

    .cycle-transfer-item-head,
    .cycle-transfer-meta {
      align-items: flex-start;
      flex-direction: column;
    }

    .rule-name {
      white-space: normal;
    }

    .progress-text {
      text-align: left;
    }
  }
}
</style>
