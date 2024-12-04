<template>
  <div
    class="world-map-group"
    :style="mapStyle"
  >
    <div class="world-map-img" />
    <transition-group
      name="point"
      tag="div"
      class="world-map-point-container"
    >
      <world-map-point
        v-for="pointItem in mapPoints"
        :key="pointItem.key"
        :info="pointItem"
        @point-tap="handlePointTap"
      />
    </transition-group>

    <transition name="point">
      <div
        v-if="tipsShow"
        class="world-map-tips"
        :style="tipsContentStyle"
      >
        <span>{{ tipsContent }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
/**
 * 世界地图盒子
 */

import {
  ref,
  computed,
} from 'vue';
import validate from '@/utils/validate';

import WorldMapPoint from './world-map-point.vue';

const props = defineProps({
  width: {
    type: [Number, String],
    // default: 1280,
    default: null,
  },
  height: {
    type: [Number, String],
    // default: 621,
    default: null,
  },
  locations: {
    type: Array,
    default: () => [],
  },
});

// 计算地图大小 保持1280:621的比例 保证地图不变形
const computedSize = computed(() => {
  if (!validate.isEmpty(props.width) && !validate.isEmpty(props.height)) {
    return {
      width: 1280,
      height: 621,
    };
  }
  const width = Number(props.width);
  const height = Number(props.height);
  if (!validate.isEmpty(props.width) && validate.isEmpty(props.height)) {
    return {
      width,
      height: Math.ceil((621 / 1280) * width),
    };
  }
  if (validate.isEmpty(props.width) && !validate.isEmpty(props.height)) {
    return {
      width: Math.ceil((1280 / 621) * height),
      height,
    };
  }
  if (width / height > 1280 / 621) {
    return {
      width: Math.ceil(height * (1280 / 621)),
      height,
    };
  }
  return {
    width,
    height: Math.ceil(width * (621 / 1280)),
  };
});

const mapStyle = computed(() => {
  const style = {};
  style['--world-map-width'] = `${computedSize.value.width}px`;
  style['--world-map-height'] = `${computedSize.value.height}px`;
  return style;
});

const mapPoints = computed(() => props.locations.map((i) => {
  const item = {
    key: i.key,
    left: (computedSize.value.width / 1280) * i.x,
    top: (computedSize.value.height / 621) * i.y,
    size: i.size || 4,
    label: i.label,
  };
  return item;
}));

/**
 * 提示框
 */
const tipsShow = ref(false);
const tipsContent = ref('');
const activeTipsXY = ref({
  x: 0,
  y: 0,
});
const tipsContentStyle = computed(() => {
  const style = {};
  if (window.innerWidth > 500) {
    style.top = `${activeTipsXY.value.y}px`;
    style.left = `${activeTipsXY.value.x}px`;
    style.transform = 'translate(-50%, 100%)';
  } else {
    style.bottom = '10px';
    style.left = '50%';
    style.transform = 'translate(-50%, 0)';
  }
  return style;
});
let timer = null;
function handlePointTap(e) {
  tipsContent.value = e.label;
  activeTipsXY.value = {
    x: e.left - (e.size / 2),
    y: e.top - e.size,
  };
  tipsShow.value = true;
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(() => {
    tipsShow.value = false;
  }, 5000);
}
</script>

<style lang="scss" scoped>
.world-map-group {
  width: var(--world-map-width, 1280px);
  height: var(--world-map-height, 621px);
  position: relative;

  .world-map-img {
    width: var(--world-map-width, 1280px);
    height: var(--world-map-height, 621px);
    background: url(@/assets/images/world-map.svg) 50% 50% no-repeat;
    background-size: 100%;
    opacity: 0.75;
  }

  .world-map-tips {
    position: absolute;
    padding: 5px 10px;
    border-radius: 5px;
    line-height: 20px;
    color: #eee;
    background: rgba(#000, 0.8);
    box-shadow: 1px 4px 8px rgba(#303841, 0.4);
    z-index: 100;
  }
}

.point-move,
.point-enter-active,
.point-leave-active {
  transition: opacity 0.3s ease-in-out;
}
.point-enter-from,
.point-leave-to {
  opacity: 0;
}
</style>
