<template>
  <div
    class="list-column"
    :class="`list-column--${prop}`"
    :style="columnStyle"
  >
    <div
      ref="columnContentRef"
      class="list-column-content"
    >
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
  ref,
  onMounted,
  onBeforeUnmount,
} from 'vue';
import {
  useStore,
} from 'vuex';

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

const store = useStore();

const columnContentRef = ref(null);
let resizeObserver = null;

const columnWidth = computed(() => store.state?.serverListColumnWidths?.[props.prop]);

onMounted(() => {
  if (columnContentRef.value) {
    resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        let { width } = entry.contentRect;
        width = Math.ceil(width);
        store.dispatch('setServerListColumnWidth', {
          prop: props.prop,
          width: width > 40 ? width : 40,
        });
      });
    });

    resizeObserver.observe(columnContentRef.value);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
});

const columnStyle = computed(() => {
  const style = {};
  if (props.width) {
    const width = parseInt(props.width, 10);
    if (Number.isNaN(width) === false) {
      style.width = `${width}px`;
    }
  } else if (columnWidth.value > 0) {
    style.width = `${columnWidth.value}px`;
  }
  return style;
});
</script>

<style lang="scss" scoped>
.list-column {
  --list-column-label-height: 16px;
  --list-column-value-height: 24px;
  position: relative;
  width: auto;
  height: calc(var(--list-column-label-height) + var(--list-column-value-height) + 10px);

  .list-column-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: max-content;
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
    .value-text {
      color: #74dbef;
    }
  }

  &--billing {
    .value-text {
      color: var(--list-item-price-color);
    }
  }
}
</style>
