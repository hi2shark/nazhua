<template>
  <div
    v-if="summary"
    class="server-list-item-cycle-transfer"
    :class="`status--${summary.statusLevel}`"
  >
    <div class="left-box">
      <span class="item-label">周期流量</span>
      <span
        class="rule-name"
        :title="summary.ruleName"
      >
        {{ summary.ruleName }}
      </span>
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
</script>

<style lang="scss" scoped>
.server-list-item-cycle-transfer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 14px 14px;
  border-top: 1px solid rgba(#fff, 0.06);
  cursor: pointer;

  .left-box,
  .right-box {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
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

  .rule-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #f3f7fa;
    font-size: 13px;
    line-height: 1.4;
  }

  .right-box {
    flex-shrink: 0;
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
    align-items: flex-start;
    padding: 0 12px 12px;

    .left-box,
    .right-box {
      flex-wrap: wrap;
    }

    .rule-name {
      white-space: normal;
      word-break: break-word;
    }
  }
}
</style>
