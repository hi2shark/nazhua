<template>
  <span
    class="cycle-transfer-summary-text"
    :class="summaryClass"
  >
    <template v-if="summary">
      <span
        v-if="showPercent"
        class="percent-text"
      >
        {{ summary.remainingPercentText }}
      </span>
    </template>
    <span
      v-else
      class="empty-text"
    >
      -
    </span>
  </span>
</template>

<script setup>
import {
  computed,
} from 'vue';

const props = defineProps({
  summary: {
    type: Object,
    default: null,
  },
});

const showPercent = computed(() => Number.isFinite(props.summary?.remainingPercent));
const summaryClass = computed(() => {
  if (!props.summary) {
    return 'status--empty';
  }
  return `status--${props.summary.statusLevel}`;
});
</script>

<style lang="scss" scoped>
.cycle-transfer-summary-text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 0;
  max-width: 100%;
  white-space: nowrap;

  .percent-text {
    color: #d6deea;
  }

  .empty-text {
    color: #bbb;
  }

  &.status--fine {
    .percent-text {
      color: #79ffbc;
    }
  }

  &.status--warning {
    .percent-text {
      color: #ffd166;
    }
  }

  &.status--alert {
    .percent-text {
      color: #ff9666;
    }
  }

  &.status--over {
    .percent-text {
      color: #ff7b8a;
    }
  }
}
</style>
