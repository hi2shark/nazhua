<template>
  <div
    class="list-column"
    :class="`list-column--${prop}`"
    :style="columnStyle"
  >
    <div class="list-column-content">
      <span class="item-label">{{ label }}</span>
      <div class="item-content">
        <template v-if="slotContent">
          <slot />
        </template>
        <template v-if="slotValue">
          <span class="item-text item-value">
            <slot name="value" />
          </span>
          <span class="item-text item-unit">
            <slot name="unit" />
          </span>
        </template>
        <template v-else>
          <span class="item-text item-value">{{ value }}</span>
          <span class="item-text item-unit">{{ unit }}</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 服务器信息列表列
 */

import {
  computed,
} from 'vue';

const props = defineProps({
  prop: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  value: {
    type: [String, Number],
    default: '',
  },
  unit: {
    type: String,
    default: '',
  },
  width: {
    type: [String, Number],
    default: null,
  },
  slotContent: {
    type: [String, Boolean],
    default: false,
  },
  slotValue: {
    type: [String, Boolean],
    default: false,
  },
});

const columnStyle = computed(() => {
  const style = {};
  const width = parseInt(props.width, 10);
  if (Number.isNaN(width) === false) {
    style.width = `${width}px`;
  }
  return style;
});
</script>

<style lang="scss" scoped>
.list-column {
  width: 50px;

  .list-column-content {
    --list-column-label-height: 16px;
    --list-column-value-height: 24px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: var(--list-item-height);

    .item-label {
      padding-top: 6px; // 视觉修正
      line-height: var(--list-column-label-height);
      font-size: 12px;
      color: #bbb;
    }
    .item-content {
      line-height: var(--list-column-value-height);
      font-size: 14px;
    }
  }

  &--duration {
    .item-value {
      color: var(--duration-color);
    }
  }

  &--load {
    .item-value {
      color: var(--load-color);
    }
  }

  &--transfer {
    width: 80px;
    .item-value {
      color: var(--transfer-color);
    }
  }

  &--inTransfer {
    .item-value {
      color: var(--transfer-in-color);
    }
  }

  &--outTransfer {
    .item-value {
      color: var(--transfer-out-color);
    }
  }

  &--inSpeed {
    .item-value {
      color: var(--net-speed-in-color);
    }
  }

  &--outSpeed {
    .item-value {
      color: var(--net-speed-out-color);
    }
  }

  &--remaining-time {
    width: 60px;
    .value-text {
      color: #74dbef;
    }
  }

  &--billing {
    width: 60px;
    .value-text {
      color: var(--list-item-price-color);
    }
  }
}
</style>
