<template>
  <div
    v-for="item in serverRealTimeList"
    :key="item.key"
    class="list-column-item list-column-item--real-time"
    :class="`list-column-item--real-time-${item.key}`"
  >
    <div class="real-time-content">
      <span class="item-label">{{ item.label }}</span>
      <div class="item-content">
        <span class="item-value">{{ item.show ? item?.value : '-' }}</span>
        <span class="item-unit item-text">{{ item.show ? item?.unit : '' }}</span>
      </div>
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
  serverRealTimeListTpls: {
    type: String,
    default: undefined,
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
  serverRealTimeListTpls: props.serverRealTimeListTpls,
});
</script>

<style lang="scss" scoped>
.list-column-item {
  .real-time-content {
    --real-time-label-height: 16px;
    --real-time-value-height: 24px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: var(--list-item-height);

    .item-label {
      padding-top: 6px; // 视觉修正
      line-height: var(--real-time-label-height);
      font-size: 12px;
      color: #ccc;
    }
    .item-content {
      line-height: var(--real-time-value-height);
      font-size: 14px;
    }
  }

  &--real-time-duration {
    width: 50px;
    .item-value {
      color: var(--duration-color);
    }
  }
  &--real-time-load {
    width: 50px;
    .item-value {
      color: var(--load-color);
    }
  }
  &--real-time-transfer {
    width: 80px;
    .item-value {
      color: var(--transfer-color);
    }
  }
  &--real-time-inSpeed {
    width: 50px;
    .item-value {
      color: var(--net-speed-in-color);
    }
  }
  &--real-time-outSpeed {
    width: 50px;
    .item-value {
      color: var(--net-speed-out-color);
    }
  }
}
</style>
