<template>
  <div class="server-real-time-group">
    <div
      v-for="item in serverRealTimeList"
      :key="item.key"
      class="server-real-time-item"
      :class="`server-real-time--${item.key}`"
    >
      <div class="item-content">
        <span class="item-value">{{ item?.value || '-' }}</span>
        <span class="item-symbol item-text">{{ item?.value ? item?.symbol : '' }}</span>
      </div>
      <span class="item-label">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup>
/**
 * 服务器数据统计
 */
import {
  inject,
} from 'vue';
import handleServerRealTime from '@/views/composable/server-real-time';

const props = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
});

const currentTime = inject('currentTime', {
  value: Date.now(),
});

const {
  serverRealTimeList,
} = handleServerRealTime({
  props,
  currentTime,
});
</script>

<style lang="scss" scoped>
.server-real-time-group {
  display: flex;
  align-items: center;

  .server-real-time-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .item-value {
      line-height: 1em;
      font-size: var(--real-time-value-font-size, 24px);
    }

    .item-content {
      display: flex;
      align-items: flex-end;
      gap: 2px;
    }

    .item-text {
      line-height: 1.3em;
      font-size: var(--real-time-text-font-size, 12px);
      color: #ddd;
    }

    .item-label {
      line-height: 1.2em;
      font-size: var(--real-time-label-font-size, 14px);
      color: #ddd;
    }
  }

  .server-real-time--duration {
    .item-value {
      color: #cbf1f5;
    }
  }
  .server-real-time--transfer {
    .item-value {
      color: #ffc300;
    }
  }
  .server-real-time--inSpeed {
    .item-value {
      color: #46cdcf;
    }
  }
  .server-real-time--outSpeed {
    .item-value {
      color: #abedd8;
    }
  }
}
</style>
