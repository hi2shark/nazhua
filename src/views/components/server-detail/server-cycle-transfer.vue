<template>
  <dot-dot-box
    v-if="showCard"
    class="server-cycle-transfer-group"
    padding="16px 20px"
  >
    <div class="module-head-group">
      <div class="left-box">
        <span class="module-title">
          周期流量
        </span>
      </div>
      <div class="right-box">
        <span
          v-if="refreshInterval > 0"
          class="refresh-tip"
        >
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
          </div>
          <span
            class="rule-status"
            :class="`status--${item.statusLevel}`"
          >
            {{ item.statusLabel }}
          </span>
        </div>

        <div class="cycle-transfer-meta">
          <span class="meta-item">周期 {{ item.periodStart }} - {{ item.periodEnd }}</span>
          <span class="meta-item">下次 {{ item.nextCheckDisplay }}</span>
        </div>

        <div class="cycle-transfer-stats">
          <span class="stats-item">已用 {{ item.currentUsageDisplay }}</span>
          <span class="stats-item">剩余 {{ item.remainingDisplay }}</span>
          <span class="stats-item">上限 {{ item.maxDisplay }}</span>
          <span
            v-if="item.showMin"
            class="stats-item"
          >
            下限 {{ item.minDisplay }}
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
    gap: 12px;
    margin-bottom: 14px;
  }

  .module-title {
    font-size: 16px;
    color: #eee;
  }

  .refresh-tip {
    color: #aeb8c2;
    font-size: 12px;
    line-height: 1.5;
  }

  .cycle-transfer-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .cycle-transfer-item {
    padding: 12px 14px;
    border: 1px solid rgba(#fff, 0.12);
    border-radius: 8px;
    background: rgba(#000, 0.15);

    &.status--fine {
      border-color: rgba(#79ffbc, 0.18);
    }

    &.status--warning {
      border-color: rgba(#ffd166, 0.18);
    }

    &.status--alert {
      border-color: rgba(#ff9666, 0.18);
    }

    &.status--over {
      border-color: rgba(#ff7b8a, 0.18);
    }
  }

  .cycle-transfer-item-head,
  .cycle-transfer-meta,
  .cycle-transfer-stats {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px 14px;
  }

  .cycle-transfer-meta,
  .cycle-transfer-stats {
    margin-top: 8px;
  }

  .rule-title-group {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .rule-id {
    color: #8bb3ff;
    font-size: 12px;
  }

  .rule-name {
    color: #f3f7fa;
    font-size: 14px;
    line-height: 1.4;
  }

  .rule-status {
    padding: 2px 8px;
    font-size: 12px;
    line-height: 18px;
    border-radius: 999px;
    border: 1px solid transparent;
  }

  .meta-item,
  .stats-item {
    color: #cdd7e1;
    font-size: 12px;
    line-height: 1.5;
  }

  .progress-group {
    margin-top: 10px;
  }

  .progress-track {
    height: 10px;
    overflow: hidden;
    background: rgba(#fff, 0.1);
    border-radius: 999px;
  }

  .progress-bar {
    height: 100%;
    border-radius: 999px;
    transition: width 0.3s ease;
  }

  .progress-text {
    margin-top: 6px;
    color: #e6edf4;
    font-size: 12px;
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
}
</style>
