<template>
  <div class="conn-group">
    <div class="conn--tcp">
      {{ tcpConnCount }}
    </div>
    <div class="split-line">
      |
    </div>
    <div class="conn--udp">
      {{ udpConnCount }}
    </div>
  </div>
</template>

<script setup>
/**
 * 连接信息
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

const tcpConnCount = computed(() => {
  const { item } = props.realTimeData?.conns || {};
  const { value } = item?.data?.tcp || {};
  return value || '-';
});
const udpConnCount = computed(() => {
  const { item } = props.realTimeData?.conns || {};
  const { value } = item?.data?.udp || {};
  return value || '-';
});

</script>

<style lang="scss" scoped>
.conn-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  width: 100%;
  .conn--tcp {
    flex: 1;
    text-align: right;
    color: var(--conn-tcp-color);
  }

  .conn--udp {
    flex: 1;
    text-align: left;
    color: var(--conn-udp-color);
  }

  .split-line {
    width: 6px;
    text-align: center;
  }
}
</style>
