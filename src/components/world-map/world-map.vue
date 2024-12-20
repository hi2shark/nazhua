<template>
  <div
    class="world-map-group"
    :class="{
      'world-map-group--light-background': lightBackground,
    }"
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
  watch,
} from 'vue';
import config from '@/config';
import validate from '@/utils/validate';

import WorldMapPoint from './world-map-point.vue';
import {
  findIntersectingGroups,
} from '@/utils/world-map';

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

const lightBackground = computed(() => config.nazhua.lightBackground);
const boxPadding = computed(() => (lightBackground.value ? 20 : 0));

// 计算地图大小 保持1280:621的比例 保证地图不变形
const computedSize = computed(() => {
  // 考虑内边距，从总宽高中减去padding
  const adjustedWidth = Number(props.width) - (boxPadding.value * 2);
  const adjustedHeight = Number(props.height) - (boxPadding.value * 2);

  if (!validate.isEmpty(props.width) && !validate.isEmpty(props.height)) {
    return {
      width: 1280,
      height: 621,
    };
  }

  if (!validate.isEmpty(props.width) && validate.isEmpty(props.height)) {
    return {
      width: adjustedWidth,
      height: Math.ceil((621 / 1280) * adjustedWidth),
    };
  }

  if (validate.isEmpty(props.width) && !validate.isEmpty(props.height)) {
    return {
      width: Math.ceil((1280 / 621) * adjustedHeight),
      height: adjustedHeight,
    };
  }

  if (adjustedWidth / adjustedHeight > 1280 / 621) {
    return {
      width: Math.ceil(adjustedHeight * (1280 / 621)),
      height: adjustedHeight,
    };
  }

  return {
    width: adjustedWidth,
    height: Math.ceil(adjustedWidth * (621 / 1280)),
  };
});

const mapStyle = computed(() => {
  const style = {};
  style['--world-map-width'] = `${computedSize.value.width}px`;
  style['--world-map-height'] = `${computedSize.value.height}px`;
  return style;
});

const mapPoints = ref([]);
let computeMapPointsTimer = null;
function computeMapPoints() {
  if (computeMapPointsTimer) {
    clearTimeout(computeMapPointsTimer);
  }
  if (props.locations.length === 0) {
    mapPoints.value = [];
    return;
  }
  computeMapPointsTimer = setTimeout(() => {
    const points = props.locations.map((i) => {
      const item = {
        key: i.key,
        left: (computedSize.value.width / 1280) * i.x + boxPadding.value,
        top: (computedSize.value.height / 621) * i.y + boxPadding.value,
        size: i.size || 4,
        label: i.label,
        servers: i.servers,
        type: 'single',
      };
      const halfSize = (item.size + 8) / 2;
      item.topLeft = {
        left: item.left - halfSize,
        top: item.top - halfSize,
      };
      item.bottomRight = {
        left: item.left + halfSize,
        top: item.top + halfSize,
      };
      return item;
    });
    const groups = findIntersectingGroups(points);
    Object.entries(groups).forEach(([key, group]) => {
      const item = points.find((i) => i.key === key);
      if (item.parent) {
        return;
      }
      item.size = 4;
      item.type = 'group';
      item.children = group;
      let label = item.label || '';
      let servers = [...(item.servers || [])];
      group.forEach((i) => {
        if (!i.parent && !i.children) {
          i.parent = item;
          label += `\n${i.label}`;
          servers = servers.concat((i.servers || []));
        }
      });
      item.label = label;
      item.servers = servers;
    });
    mapPoints.value = points.filter((i) => !i.parent);
  }, 100);
}

watch(() => props.locations, () => {
  computeMapPoints();
}, {
  immediate: true,
});

watch(() => computedSize.value, () => {
  computeMapPoints();
}, {
  immediate: true,
  deep: true,
});

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
    style.transform = 'translate(-50%, 20px)';
  } else {
    style.bottom = '4px';
    style.left = '50%';
    style.transform = 'translate(-50%, 0)';
  }
  return style;
});
let handlePointTapTimer = null;
function handlePointTap(e) {
  tipsContent.value = e.label;
  activeTipsXY.value = {
    x: e.left,
    y: e.top - 10,
  };
  tipsShow.value = true;
  if (handlePointTapTimer) {
    clearTimeout(handlePointTapTimer);
  }
  handlePointTapTimer = setTimeout(() => {
    tipsShow.value = false;
  }, 5000);
}
</script>

<style lang="scss" scoped>
.world-map-group {
  width: var(--world-map-width, 1280px);
  height: var(--world-map-height, 621px);
  position: relative;

  &--light-background {
    padding: 20px;
    background: rgba(#000, 0.6);
    border-radius: 12px;
    box-sizing: content-box;
    transition: background-color 0.3s linear;

    .world-map-img {
      opacity: 1;
    }

    &:hover {
      background: rgba(#000, 0.9);
    }

    @media screen and (max-width: 768px) {
      background: rgba(#000, 0.8);

      &:hover {
        background: rgba(#000, 0.8);
      }
    }
  }

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
    white-space: pre;
    color: #eee;
    background: rgba(#000, 0.8);
    box-shadow: 1px 4px 8px rgba(#303841, 0.4);
    z-index: 100;

    // 向上的尖角
    &::before {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 50%;
      width: 0;
      height: 0;
      border: 5px solid transparent;
      border-bottom-color: rgba(#000, 0.8);
      transform: translateX(-50%);
    }

    @media screen and (max-width: 500px) {
      line-height: 16px;
      font-size: 12px;

      &::before {
        display: none;
      }
    }
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
