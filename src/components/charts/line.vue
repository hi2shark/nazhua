<template>
  <div
    v-if="option"
    class="line-box"
  >
    <v-chart
      ref="chartRef"
      class="chart"
      :option="option"
    />
  </div>
</template>

<script setup>
/**
 * 折线图
 */
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
} from 'vue';
import VChart from 'vue-echarts';
import lineChart from './line';

const props = defineProps({
  cateList: {
    type: Array,
    default: () => [],
  },
  dateList: {
    type: Array,
    default: () => [],
  },
  valueList: {
    type: Array,
    default: () => [],
  },
  size: {
    type: [Number, String],
    default: null,
  },
});

const chartRef = ref();
const option = computed(() => {
  if (props.cateList && props.dateList && props.valueList) {
    return lineChart(
      props.cateList,
      props.dateList,
      props.valueList,
    );
  }
  return null;
});

function handleResize() {
  chartRef.value?.resize?.();
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
.line-box {
  width: 100%;
  height: var(--line-chart-size, 300px);
}
</style>
