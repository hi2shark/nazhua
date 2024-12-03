<template>
  <div
    v-if="option"
    ref="chartBoxRef"
    class="donut-box"
    :class="{
      'donut-box--content': showContent,
    }"
  >
    <v-chart
      ref="chartRef"
      class="donut-box-v-chart"
      :option="option"
    />
    <div
      v-if="showContent"
      class="donunt-content"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
/**
 * 环状图
 */

import {
  ref,
  computed,
  onMounted,
  onUnmounted,
} from 'vue';
import VChart from 'vue-echarts';
import donut from './donut';

const props = defineProps({
  used: {
    type: [Number, String],
    default: 0,
  },
  total: {
    type: [Number, String],
    default: 100,
  },
  itemColors: {
    type: [Object, String],
    default: () => ({
      used: '#409EFF',
      total: '#E6A23C',
    }),
  },
  showContent: {
    type: Boolean,
    default: true,
  },
});

const chartBoxRef = ref();
const chartRef = ref();
const chartSize = ref(100);
const option = computed(() => {
  if (props.used) {
    return donut(
      props.used,
      props.total,
      props.itemColors,
      chartSize.value || 100,
    );
  }
  return null;
});

function handleResize() {
  const {
    offsetWidth,
    offsetHeight,
  } = chartBoxRef.value;
  const oldSize = chartSize.value;
  chartSize.value = Math.floor(Math.min(offsetWidth, offsetHeight));
  if (oldSize !== chartSize.value && chartRef?.value?.resize) {
    chartRef.value.resize();
  }
}

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
.donut-box {
  width: var(--donut-box-size, 100px);
  height: var(--donut-box-size, 100px);
}

.donut-box--content {
  position: relative;
  .donunt-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
