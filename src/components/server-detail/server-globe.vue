<template>
  <div
    ref="boxRef"
    class="server-globe"
    :class="{
      'server-globe--has-location': hasLocation,
    }"
  >
    <v-chart
      v-if="ready && globeTextureCanvas && sizeReady"
      ref="chartRef"
      class="server-globe__chart"
      :option="option"
      autoresize
    />
    <div
      v-if="locationName && ready && globeTextureCanvas"
      class="server-globe__label"
    >
      {{ locationName }}
    </div>
  </div>
</template>

<script setup>
/**
 * 节点位置地球仪
 *
 * 使用 ECharts GL 渲染 3D 地球，并在国家层面高亮节点所在位置。
 */

import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  onActivated,
  onDeactivated,
} from 'vue';
import VChart from 'vue-echarts';
import * as echarts from 'echarts';
import 'echarts-gl';

const props = defineProps({
  location: {
    type: Object,
    default: () => ({}),
  },
});

const boxRef = ref(null);
const chartRef = ref(null);

const boxSize = ref({
  width: 0,
  height: 0,
});
const isDeactivated = ref(false);
const sizeReady = computed(() => !isDeactivated.value
  && boxSize.value.width > 0
  && boxSize.value.height > 0);

const worldGeoJson = ref(null);
const countryNameMap = ref(null);
const loaded = ref(false);

const hasLocation = computed(() => props.location
  && typeof props.location.lon === 'number'
  && typeof props.location.lat === 'number');
const targetCountryCode = computed(() => props.location?.countryCode?.toLowerCase() || '');
const targetCountryName = computed(() => countryNameMap.value?.[targetCountryCode.value] || '');
const locationName = computed(() => targetCountryName.value || props.location?.name || '');
const ready = computed(() => loaded.value && hasLocation.value);

let resizeObserver = null;

function updateBoxSize() {
  if (!boxRef.value) return;
  const rect = boxRef.value.getBoundingClientRect();
  boxSize.value = {
    width: rect.width,
    height: rect.height,
  };
}

onMounted(async () => {
  updateBoxSize();
  if (typeof ResizeObserver !== 'undefined' && boxRef.value) {
    resizeObserver = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (cr) {
        boxSize.value = {
          width: cr.width,
          height: cr.height,
        };
      }
    });
    resizeObserver.observe(boxRef.value);
  }

  const [geoJson, nameMap] = await Promise.all([
    import('@/data/world.geo.json'),
    import('@/data/country-name-map'),
  ]);
  worldGeoJson.value = geoJson.default;
  countryNameMap.value = nameMap.default;
  echarts.registerMap('world', worldGeoJson.value);
  loaded.value = true;
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
});

onActivated(() => {
  isDeactivated.value = false;
  updateBoxSize();
});

onDeactivated(() => {
  isDeactivated.value = true;
});

const TEXTURE_WIDTH = 2048;
const TEXTURE_HEIGHT = 1024;

const OCEAN_COLOR = '#0b1016';
const LAND_COLOR = '#1c2a35';
const LAND_BORDER_COLOR = 'rgba(203, 241, 245, 0.18)';
const HIGHLIGHT_COLOR = '#00d4ff';
const ATMOSPHERE_COLOR = '#00d4ff';

/**
 * 根据国家名称从 GeoJSON 中查找对应要素
 */
function findCountryFeature(geoJson, countryName) {
  return geoJson?.features?.find((feature) => feature.properties?.name === countryName);
}

/**
 * 计算国家要素的边界框中心点
 */
function getCountryCenter(feature) {
  if (!feature) return null;

  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  function processCoord(coord) {
    const [lon, lat] = coord;
    minLon = Math.min(minLon, lon);
    maxLon = Math.max(maxLon, lon);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }

  function processGeometry(geometry) {
    const { type, coordinates } = geometry;
    if (type === 'Polygon') {
      coordinates.forEach((ring) => ring.forEach(processCoord));
    } else if (type === 'MultiPolygon') {
      coordinates.forEach((polygon) => polygon.forEach((ring) => ring.forEach(processCoord)));
    }
  }

  processGeometry(feature.geometry);

  return [
    (minLon + maxLon) / 2,
    (minLat + maxLat) / 2,
  ];
}

const targetCenter = computed(() => {
  if (!ready.value || !worldGeoJson.value || !targetCountryName.value) {
    return null;
  }
  const feature = findCountryFeature(worldGeoJson.value, targetCountryName.value);
  return getCountryCenter(feature);
});

/**
 * 在 canvas 上绘制单个国家要素（使用等距圆柱投影）
 */
function drawFeatureOnCanvas(ctx, feature, color) {
  if (!feature) return;

  const { width, height } = ctx.canvas;

  function project(coord) {
    const [lon, lat] = coord;
    return [
      ((lon + 180) / 360) * width,
      ((90 - lat) / 180) * height,
    ];
  }

  function drawPolygon(polygon) {
    polygon.forEach((ring) => {
      ring.forEach((coord, i) => {
        const [x, y] = project(coord);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
    });
  }

  ctx.beginPath();
  const { type, coordinates } = feature.geometry;
  if (type === 'Polygon') {
    drawPolygon(coordinates);
  } else if (type === 'MultiPolygon') {
    coordinates.forEach(drawPolygon);
  }
  ctx.fillStyle = color;
  ctx.fill();
}

function createBaseMapChart() {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;

  const mapChart = echarts.init(canvas, null, {
    width: TEXTURE_WIDTH,
    height: TEXTURE_HEIGHT,
  });

  mapChart.setOption({
    backgroundColor: OCEAN_COLOR,
    animation: false,
    series: [{
      type: 'map',
      map: 'world',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      boundingCoords: [[-180, 90], [180, -90]],
      silent: true,
      itemStyle: {
        areaColor: LAND_COLOR,
        borderColor: LAND_BORDER_COLOR,
        borderWidth: 1,
      },
      emphasis: {
        disabled: true,
      },
      select: {
        disabled: true,
      },
    }],
  }, {
    notMerge: true,
    lazyUpdate: false,
  });

  return mapChart;
}

const globeTextureCanvas = ref(null);
let currentMapChart = null;

async function updateGlobeTexture() {
  if (currentMapChart) {
    currentMapChart.dispose();
    currentMapChart = null;
  }
  globeTextureCanvas.value = null;

  if (!ready.value || !targetCountryName.value) {
    return;
  }

  const geoJson = worldGeoJson.value;
  const countryName = targetCountryName.value;
  const feature = findCountryFeature(geoJson, countryName);

  currentMapChart = createBaseMapChart();

  // 等待地图渲染完成
  await new Promise((resolve) => {
    let resolved = false;
    const done = () => {
      if (resolved) return;
      resolved = true;
      resolve();
    };
    currentMapChart.on('finished', done);
    setTimeout(done, 500);
  });

  await new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });

  // 把 ECharts 渲染好的底图复制到新的 canvas，再手动绘制高亮国家
  const sourceCanvas = currentMapChart.getDom();
  const targetCanvas = document.createElement('canvas');
  targetCanvas.width = TEXTURE_WIDTH;
  targetCanvas.height = TEXTURE_HEIGHT;

  const ctx = targetCanvas.getContext('2d');
  ctx.drawImage(sourceCanvas, 0, 0);

  if (feature) {
    drawFeatureOnCanvas(ctx, feature, HIGHLIGHT_COLOR);
  }

  currentMapChart.dispose();
  currentMapChart = null;

  globeTextureCanvas.value = targetCanvas;
}

watch(() => [
  ready.value,
  targetCountryName.value,
], updateGlobeTexture, {
  immediate: true,
});

onUnmounted(() => {
  if (currentMapChart) {
    currentMapChart.dispose();
    currentMapChart = null;
  }
});

const option = computed(() => {
  if (!ready.value || !globeTextureCanvas.value || !targetCenter.value) {
    return null;
  }

  const [targetLon, targetLat] = targetCenter.value;

  return {
    backgroundColor: 'transparent',
    globe: {
      baseTexture: globeTextureCanvas.value,
      shading: 'lambert',
      environment: 'none',
      light: {
        ambient: {
          intensity: 0.5,
        },
        main: {
          intensity: 1.4,
          shadow: true,
          alpha: 25,
          beta: 20,
        },
      },
      viewControl: {
        autoRotate: false,
        autoRotateSpeed: 0,
        rotateSensitivity: 0,
        zoomSensitivity: 0,
        panSensitivity: 0,
        targetCoord: [targetLon, targetLat],
        distance: 150,
        minDistance: 100,
        maxDistance: 300,
      },
      postEffect: {
        enable: true,
        SSAO: {
          enable: true,
          radius: 4,
          intensity: 1.2,
          quality: 'medium',
        },
      },
      atmosphere: {
        show: true,
        color: ATMOSPHERE_COLOR,
        glowPower: 80,
        innerGlowPower: 2.4,
        offset: 0,
      },
    },
    series: [],
  };
});
</script>

<style lang="scss" scoped>
.server-globe {
  position: relative;
  width: 170px;
  height: 170px;
  flex-shrink: 0;

  &__chart {
    width: 100%;
    height: 100%;
  }

  &__label {
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%);
    padding: 1px 8px;
    border-radius: 10px;
    line-height: 16px;
    font-size: 11px;
    white-space: nowrap;
    color: #cbf1f5;
    background: rgba(0, 0, 0, 0.45);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &--has-location:hover &__label {
    opacity: 1;
  }

  @media screen and (max-width: 500px) {
    width: 110px;
    height: 110px;

    &__label {
      display: none;
    }
  }
}
</style>
