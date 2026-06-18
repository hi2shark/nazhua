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
import {
  geoEquirectangular,
  geoPath,
} from 'd3-geo';
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

const OCEAN_COLOR = '#081f2a';
const LAND_COLOR = '#315a6e';
const LAND_BORDER_COLOR = 'rgba(144, 242, 255, 0.34)';
const HIGHLIGHT_COLOR = '#00dcff';
const ATMOSPHERE_COLOR = '#00d4ff';
const MARKER_COLOR = '#e0fcff';

/**
 * 根据国家名称从 GeoJSON 中查找对应要素
 */
function findCountryFeature(geoJson, countryName) {
  return geoJson?.features?.find((feature) => feature.properties?.name === countryName);
}

const targetCountryFeature = computed(() => {
  if (!ready.value || !worldGeoJson.value || !targetCountryName.value) {
    return null;
  }
  return findCountryFeature(worldGeoJson.value, targetCountryName.value);
});

const targetCoord = computed(() => {
  if (!ready.value) {
    return null;
  }

  return [
    props.location.lon,
    props.location.lat,
  ];
});

/**
 * 在 canvas 上绘制单个国家要素（使用等距圆柱投影）
 */
function drawFeatureOnCanvas(ctx, path, feature, color, options = {}) {
  if (!feature) return;

  const {
    strokeColor = '',
    lineWidth = 0,
  } = options;
  ctx.beginPath();
  path(feature);
  ctx.fillStyle = color;
  ctx.fill('evenodd');

  if (strokeColor && lineWidth > 0) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function drawLocationMarkerOnCanvas(ctx, projection, location) {
  if (!location || typeof location.lon !== 'number' || typeof location.lat !== 'number') {
    return;
  }

  const point = projection([location.lon, location.lat]);
  if (!point) return;

  const [x, y] = point;

  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 220, 255, 0.2)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fillStyle = MARKER_COLOR;
  ctx.shadowColor = HIGHLIGHT_COLOR;
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.shadowBlur = 0;
}

function createGlobeTexture(geoJson, highlightFeature, location) {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = OCEAN_COLOR;
  ctx.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const projection = geoEquirectangular()
    .scale(TEXTURE_WIDTH / (2 * Math.PI))
    .translate([TEXTURE_WIDTH / 2, TEXTURE_HEIGHT / 2])
    .precision(0.1);
  const path = geoPath(projection, ctx);

  geoJson?.features?.forEach((feature) => {
    drawFeatureOnCanvas(ctx, path, feature, LAND_COLOR, {
      strokeColor: LAND_BORDER_COLOR,
      lineWidth: 1,
    });
  });

  if (highlightFeature) {
    drawFeatureOnCanvas(ctx, path, highlightFeature, HIGHLIGHT_COLOR, {
      strokeColor: 'rgba(224, 252, 255, 0.72)',
      lineWidth: 1.5,
    });
  }

  drawLocationMarkerOnCanvas(ctx, projection, location);

  return canvas;
}

const globeTextureCanvas = ref(null);

function updateGlobeTexture() {
  globeTextureCanvas.value = null;

  if (!ready.value) {
    return;
  }

  const geoJson = worldGeoJson.value;

  globeTextureCanvas.value = createGlobeTexture(geoJson, targetCountryFeature.value, props.location);
}

watch(() => [
  ready.value,
  targetCountryName.value,
  props.location?.lon,
  props.location?.lat,
], updateGlobeTexture, {
  immediate: true,
});

const option = computed(() => {
  if (!ready.value || !globeTextureCanvas.value || !targetCoord.value) {
    return null;
  }

  const [targetLon, targetLat] = targetCoord.value;

  return {
    backgroundColor: 'transparent',
    globe: {
      baseTexture: globeTextureCanvas.value,
      shading: 'lambert',
      environment: 'none',
      light: {
        ambient: {
          intensity: 0.82,
        },
        main: {
          intensity: 1.18,
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
          intensity: 0.68,
          quality: 'medium',
        },
      },
      atmosphere: {
        show: true,
        color: ATMOSPHERE_COLOR,
        glowPower: 80,
        innerGlowPower: 2.2,
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
    filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.28));
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
