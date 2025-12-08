<template>
  <th
    class="server-status-th"
    :class="columnClass"
    :style="columnStyle"
  >
    {{ column.label }}
  </th>
</template>

<script setup>
/**
 * 自定义TH组件
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
  const className = {};
  if (props.column.align) {
    className[`server-status-th--align-${props.column.align}`] = true;
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

</script>

<style lang="scss" scoped>
.server-status-th {
  padding: var(--server-status-cell-padding);

  text-align: center;

  &--align-center {
    text-align: center;
  }
  &--align-right {
    text-align: right;
  }
  &--align-left {
    text-align: left;
  }
}
</style>
