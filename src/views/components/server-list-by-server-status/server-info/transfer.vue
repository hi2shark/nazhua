<template>
  <div class="transfer-group">
    <div class="transfer--in">
      {{ transferIn }}
    </div>
    <div class="split-line">
      |
    </div>
    <div class="transfer--out">
      {{ transferOut }}
    </div>
  </div>
</template>

<script setup>
/**
 * 流量信息
 */

import {
  computed,
} from 'vue';

const props = defineProps({
  realTimeData: {
    type: Object,
    default: () => ({}),
  },
});

const transferIn = computed(() => {
  const { item } = props.realTimeData?.transfer || {};
  if (item?.data?.in) {
    const { value, unit } = item.data.in;
    return `${value}${unit}`;
  }
  return '-';
});
const transferOut = computed(() => {
  const { item } = props.realTimeData?.transfer || {};
  if (item?.data?.out) {
    const { value, unit } = item.data.out;
    return `${value}${unit}`;
  }
  return '-';
});

</script>

<style lang="scss" scoped>
.transfer-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  width: 100%;
  .transfer--in {
    flex: 1;
    text-align: right;
    color: var(--transfer-in-color);
  }

  .transfer--out {
    flex: 1;
    text-align: left;
    color: var(--transfer-out-color);
  }

  .split-line {
    width: 4px;
    text-align: center;
  }
}
</style>
