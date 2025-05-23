<template>
  <div
    class="server-status"
    :class="'server-status--' + type"
  >
    <div class="server-status-donut">
      <chart-donut
        :size="size"
        :used="Math.min(Math.max(used, 1), 100)"
        :item-colors="colors"
      >
        <template #default>
          <div
            class="chart-donut-label"
            :title="valPercent ? valPercent : `${(used).toFixed(1) * 1}%`"
          >
            <div class="server-status-val-text">
              <span>{{ valText }}</span>
            </div>
            <div class="server-status-label">
              {{ label }}
            </div>
          </div>
        </template>
      </chart-donut>
    </div>

    <div
      v-if="content"
      class="server-status-content"
    >
      <span
        v-if="content?.default"
        class="default-content"
      >
        {{ content?.default }}
      </span>
      <span
        v-if="content?.mobile"
        class="default-mobile"
      >
        {{ content?.mobile }}
      </span>
    </div>
  </div>
</template>

<script setup>
/**
 * 服务器状态单项
 */

import ChartDonut from '@/components/charts/donut.vue';

defineProps({
  type: {
    type: String,
    default: '',
  },
  size: {
    type: Number,
    default: 100,
  },
  used: {
    type: [Number, String],
    default: 1,
  },
  colors: {
    type: Object,
    default: () => ({}),
  },
  valText: {
    type: String,
    default: '',
  },
  valPercent: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  content: {
    type: [String, Object],
    default: '',
  },
});
</script>

<style lang="scss" scoped>
.server-status {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;

  .server-status-donut {
    --donut-box-size: var(--server-status-size);
    height: var(--server-status-size);
  }

  .chart-donut-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transform: scale(var(--server-status-label-scale, 1));
    cursor: pointer;
  }

  .server-status-val-text {
    line-height: 1.2em;
    font-size: var(--server-status-val-text-font-size, 14px);
    color: var(--server-status-value-color);
  }
  .server-status-label {
    line-height: 1.1em;
    font-size: var(--server-status-label-font-size, 12px);
    color: var(--server-status-label-color);
  }

  .server-status-content {
    line-height: 1.2em;
    font-size: var(--server-status-content-font-size, 14px);
    color: var(--server-status-content-color);

    .default-mobile {
      display: none;
    }

    @media screen and (max-width: 768px) {
      .default-content {
        display: none;
      }
      .default-mobile {
        display: block;
      }
    }
  }
}
</style>
