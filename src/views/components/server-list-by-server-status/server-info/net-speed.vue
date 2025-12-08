<template>
  <div class="net-speed-group">
    <div class="net-speed--in">
      {{ inSpeed }}
    </div>
    <div class="split-line">
      |
    </div>
    <div class="net-speed--out">
      {{ outSpeed }}
    </div>
  </div>
</template>

<script setup>
/**
 * 网速信息
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

const inSpeed = computed(() => {
  const { item } = props.realTimeData?.speeds || {};
  if (item?.data?.in) {
    const { value, unit } = item.data.in;
    return `${value}${unit}`;
  }
  return '-';
});
const outSpeed = computed(() => {
  const { item } = props.realTimeData?.speeds || {};
  if (item?.data?.out) {
    const { value, unit } = item.data.out;
    return `${value}${unit}`;
  }
  return '-';
});

</script>

<style lang="scss" scoped>
.net-speed-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  width: 100%;
  .net-speed--in {
    flex: 1;
    text-align: right;
    color: var(--net-speed-in-color);
  }

  .net-speed--out {
    flex: 1;
    text-align: left;
    color: var(--net-speed-out-color);
  }

  .split-line {
    width: 4px;
    text-align: center;
  }
}
</style>
