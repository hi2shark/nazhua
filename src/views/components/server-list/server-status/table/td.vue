<template>
  <td
    class="server-status-td server-status-body-td"
    :class="columnClass"
    :style="columnStyle"
  >
    <div
      class="server-status-td-content"
      :class="'server-status-td-content--' + tdContent.prop"
    >
      <template
        v-if="tdContent.type === 'text'"
      >
        <span
          v-if="isSet(tdContent.value)"
          class="text--value"
        >
          {{ tdContent.value }}
        </span>
        <span
          v-if="isSet(tdContent.unit)"
          class="text--unit"
        >
          {{ tdContent.unit }}
        </span>
        <span
          v-if="!isSet(tdContent.value) && isSet(tdContent.text)"
          class="text"
        >
          {{ tdContent.text }}
        </span>
      </template>
      <template
        v-if="tdContent.type === 'component'"
      >
        <component :is="tdContent.component" />
      </template>
    </div>
  </td>
</template>

<script setup>
/**
 * 自定义TD组件
 */

import {
  computed,
} from 'vue';

const props = defineProps({
  column: {
    type: Object,
    default: () => ({}),
  },
});

// 计算css的长度单位
const getCssLengthUnit = (value) => {
  if (typeof value === 'number') {
    return `${value}px`;
  }
  return value;
};

const columnClass = computed(() => {
  const className = {
    [`server-status-td--${props.column.prop}`]: true,
  };
  if (props.column.align) {
    className[`server-status-td--align-${props.column.align}`] = true;
  }
  return className;
});

const columnStyle = computed(() => {
  const style = {};
  if (props.column.width) {
    style.width = getCssLengthUnit(props.column.width);
  }
  if (props.column.minWidth) {
    style.minWidth = getCssLengthUnit(props.column.minWidth);
  }
  return style;
});

const tdContent = computed(() => {
  if (['text', 'component'].includes(props.column.data.type)) {
    return props.column.data;
  }
  return '';
});

function isSet(value) {
  return value !== undefined && value !== null && value !== '';
}
</script>

<style lang="scss" scoped>
.server-status-td {
  height: var(--server-status-td-height);
  padding: var(--server-status-cell-padding);

  --td-content-justify-content: center;

  &--align-center {
    --td-content-justify-content: center;
  }
  &--align-right {
    --td-content-justify-content: flex-end;
  }
  &--align-left {
    --td-content-justify-content: flex-start;
  }

  .server-status-td-content {
    display: flex;
    align-items: center;
    justify-content: var(--td-content-justify-content);
    width: 100%;

    &--transfer {
      .text--value {
        color: var(--transfer-color);
      }
    }

    &--inTransfer {
      .text--value {
        color: var(--transfer-in-color);
      }
    }
    &--outTransfer {
      .text--value {
        color: var(--transfer-out-color);
      }
    }

    &--inSpeed {
      .text--value {
        color: var(--net-speed-in-color);
      }
    }

    &--outSpeed {
      .text--value {
        color: var(--net-speed-out-color);
      }
    }

    &--load {
      .text--value {
        color: var(--load-color);
      }
    }

    &--duration {
      .text--value {
        color: var(--duration-color);
      }
    }

    &--cpuText {
      .text--value {
        color: var(--cpu-text-color);
      }
    }

    &--memText {
      .text--value {
        color: var(--mem-text-color);
      }
    }

    &--swapText {
      .text--value {
        color: var(--swap-text-color);
      }
    }

    &--diskText {
      .text--value {
        color: var(--disk-text-color);
      }
    }

    &--billing {
      font-size: 12px;
    }

    &--remainingTime {
      font-size: 12px;
    }
  }
}
</style>
