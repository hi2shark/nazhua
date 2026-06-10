<template>
  <div
    v-if="summary"
    class="server-list-item-cycle-transfer"
    :class="`status--${summary.statusLevel}`"
  >
    <div class="summary-head">
      <div class="left-box">
        <span class="item-label">周期流量</span>
      </div>
      <div class="right-box">
        <span
          class="status-badge"
          :class="`status--${summary.statusLevel}`"
        >
          {{ summary.statusLabel }}
        </span>
        <span
          v-if="showPercent"
          class="percent-text"
        >
          {{ summary.remainingPercentText }}
        </span>
      </div>
    </div>

    <div
      v-if="showProgress"
      class="progress-group"
    >
      <div class="progress-track">
        <div
          class="progress-bar"
          :class="`status--${summary.statusLevel}`"
          :style="{
            width: `${progressWidth}%`,
          }"
        />
      </div>
      <div class="progress-text">
        <span>已用 {{ summary.currentUsageDisplay }} / {{ summary.maxDisplay }}</span>
        <span>剩余 {{ summary.remainingDisplay }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  inject,
} from 'vue';
import {
  getCycleTransferSummaryByServer,
} from '@/utils/cycle-transfer';

const props = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
});

const listCycleTransferMap = inject('listCycleTransferMap', {
  value: {},
});

const summary = computed(() => getCycleTransferSummaryByServer(listCycleTransferMap.value, props.info));
const showPercent = computed(() => Number.isFinite(summary.value?.remainingPercent));
const showProgress = computed(() => Number.isFinite(summary.value?.remainingPercent));
const progressWidth = computed(() => {
  if (!Number.isFinite(summary.value?.remainingPercent)) {
    return 0;
  }
  return Math.max(Math.min(100 - summary.value.remainingPercent, 100), 0);
});
</script>

<style lang="scss" scoped>
.server-list-item-cycle-transfer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 6px 14px 14px;
  border-top: 1px solid rgba(#fff, 0.06);
  cursor: pointer;

  .summary-head,
  .left-box,
  .right-box {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .summary-head {
    width: 100%;
    justify-content: space-between;
  }

  .left-box {
    flex: 1;
  }

  .item-label {
    flex-shrink: 0;
    color: #aeb8c2;
    font-size: 12px;
    line-height: 1.4;
  }

  .right-box {
    flex-shrink: 0;
  }

  .progress-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .progress-track {
    width: 100%;
    height: 6px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(#fff, 0.1);
  }

  .progress-bar {
    height: 100%;
    border-radius: inherit;
    transition: width 0.3s ease;

    &.status--fine {
      background: #79ffbc;
    }

    &.status--warning {
      background: #ffd166;
    }

    &.status--alert {
      background: #ff9666;
    }

    &.status--over {
      background: #ff7b8a;
    }

    &.status--neutral {
      background: #8bb3ff;
    }
  }

  .progress-text {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px 12px;
    color: #aeb8c2;
    font-size: 12px;
    line-height: 1.4;
  }

  .status-badge {
    padding: 2px 8px;
    border: 1px solid rgba(#fff, 0.18);
    border-radius: 999px;
    font-size: 12px;
    line-height: 1.4;
    white-space: nowrap;

    &.status--fine {
      color: #79ffbc;
      border-color: rgba(#79ffbc, 0.35);
    }

    &.status--warning {
      color: #ffd166;
      border-color: rgba(#ffd166, 0.35);
    }

    &.status--alert {
      color: #ff9666;
      border-color: rgba(#ff9666, 0.35);
    }

    &.status--over {
      color: #ff7b8a;
      border-color: rgba(#ff7b8a, 0.35);
    }

    &.status--neutral {
      color: #d6deea;
      border-color: rgba(#d6deea, 0.2);
    }
  }

  .percent-text {
    color: #d6deea;
    font-size: 12px;
    line-height: 1.4;
    white-space: nowrap;
  }

  @media screen and (max-width: 720px) {
    padding: 0 12px 12px;

    .summary-head,
    .left-box,
    .right-box {
      flex-wrap: wrap;
    }

    .right-box {
      justify-content: flex-start;
    }

    .progress-text {
      flex-wrap: wrap;
    }
  }
}
</style>
