<template>
  <div class="server-real-time-group">
    <div
      v-for="item in serverRealTimeList"
      :key="item.key"
      class="server-real-time-item"
      :class="`server-real-time--${item.key}`"
    >
      <div class="item-content">
        <div
          v-if="item.show && item.values"
          class="item-content-sub-group"
        >
          <span
            v-for="subItem in item.values"
            :key="`${item.key}_${subItem.key}`"
            class="item-content-sub-item"
            :class="`item-content-sub-item--${item.key}-${subItem.key}`"
          >
            <span class="item-content-sub-label">
              {{ subItem.label }}
            </span>
            <span class="item-content-sub-content">
              <span class="item-value">{{ subItem.show ? subItem?.value : '-' }}</span>
              <span class="item-unit item-text">{{ subItem.show ? subItem?.unit : '' }}</span>
            </span>
          </span>
        </div>
        <template v-else>
          <span class="item-value">{{ item.show ? item?.value : '-' }}</span>
          <span class="item-unit item-text">{{ item.show ? item?.unit : '' }}</span>
        </template>
      </div>
      <span
        v-if="!item.values"
        class="item-label"
      >
        {{ item.label }}
      </span>
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
.server-real-time-group {
  display: flex;
  align-items: center;

  .server-real-time-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: default;

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

    .item-content-sub-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .item-content-sub-item {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 2px;
      }

      .item-content-sub-content {
        display: flex;
        align-items: center;
      }

      .item-value {
        line-height: 1em;
        font-size: var(--real-time-label-font-size, 14px);
      }

      .item-text {
        line-height: 1em;
        font-size: var(--real-time-label-font-size, 14px);
      }

      .item-label {
        line-height: 1em;
        font-size: var(--real-time-label-font-size, 14px);
      }

      .item-content-sub-item--speeds-in {
        .item-value {
          color: var(--net-speed-in-color);
        }
      }
      .item-content-sub-item--speeds-out {
        .item-value {
          color: var(--net-speed-out-color);
        }
      }
    }
  }

  .server-real-time--duration {
    .item-value {
      color: var(--duration-color);
    }
  }
  .server-real-time--transfer {
    .item-value {
      color: var(--transfer-color);
    }
  }
  .server-real-time--inSpeed,
  .server-real-time--speed {
    .item-value {
      color: var(--net-speed-in-color);
    }
  }
  .server-real-time--outSpeed {
    .item-value {
      color: var(--net-speed-out-color);
    }
  }
}
</style>
