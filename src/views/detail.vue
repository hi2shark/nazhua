<template>
  <div
    v-if="info"
    ref="detailContainerRef"
    class="detail-container"
    :class="{
      'server--offline': info?.online !== 1,
    }"
  >
    <template v-if="showWorldMap && worldMapPosition === 'top'">
      <world-map
        :width="worldMapWidth"
        :locations="locations"
      />
    </template>
    <server-name
      :key="`${info.ID}_name`"
      :info="info"
      :location="serverLocation"
    />
    <server-status-box
      :key="`${info.ID}_status`"
      :info="info"
    />
    <server-cycle-transfer
      :key="`${info.ID}_cycle_transfer`"
      :info="info"
    />
    <server-info-box
      :key="`${info.ID}_info`"
      :info="info"
    />
    <server-monitor
      :key="`${info.ID}_monitor`"
      :info="info"
    />
    <template v-if="showWorldMap && worldMapPosition === 'bottom'">
      <world-map
        :width="worldMapWidth"
        :locations="locations"
      />
    </template>
  </div>
</template>

<script setup>
/**
 * 单节点详情
 */

import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  onActivated,
  nextTick,
  watch,
} from 'vue';
import {
  useStore,
} from 'vuex';
import {
  useRouter,
} from 'vue-router';

import config from '@/config';
import {
  alias2code,
  locationCode2Info,
  locationCode2GeoInfo,
} from '@/utils/world-map';
import pageTitle from '@/utils/page-title';

import WorldMap from '@/components/world-map/world-map.vue';
import ServerName from './components/server-detail/server-name.vue';
import ServerStatusBox from './components/server-detail/server-status-box.vue';
import ServerInfoBox from './components/server-detail/server-info-box.vue';
import ServerCycleTransfer from './components/server-detail/server-cycle-transfer.vue';
import ServerMonitor from './components/server-detail/server-monitor.vue';

const props = defineProps({
  serverId: {
    type: [String, Number],
    default: null,
  },
});

const store = useStore();
const router = useRouter();

const detailContainerRef = ref(null);
const worldMapWidth = ref(900);
const info = computed(() => store.state?.serverList?.find?.((i) => +i.ID === +props.serverId));
const dataInit = computed(() => store.state.init);

const serverLocation = computed(() => {
  let aliasCode;
  let locationCode;
  if (info?.value?.PublicNote?.customData?.location) {
    aliasCode = info?.value?.PublicNote?.customData?.location;
    locationCode = info?.value?.PublicNote?.customData?.location;
  } else if (info?.value?.Host?.CountryCode) {
    aliasCode = info.value.Host.CountryCode.toUpperCase();
  }
  const normalizedAliasCode = typeof aliasCode === 'string' ? aliasCode.toUpperCase() : aliasCode;
  const code = alias2code(normalizedAliasCode) || locationCode || normalizedAliasCode;
  if (!code) {
    return null;
  }
  const locationInfo = locationCode2Info(code) || {};
  const geoInfo = locationCode2GeoInfo(code) || locationCode2GeoInfo(normalizedAliasCode) || {};
  const {
    x,
    y,
    name,
    lon,
    lat,
  } = {
    ...geoInfo,
    ...locationInfo,
  };
  const hasMapCoord = typeof x === 'number' && typeof y === 'number';
  const hasGeoCoord = typeof lon === 'number' && typeof lat === 'number';
  if (!hasMapCoord && !hasGeoCoord) {
    return null;
  }
  return {
    code,
    name,
    x,
    y,
    lon: hasGeoCoord ? lon : (x / 1280) * 360 - 180,
    lat: hasGeoCoord ? lat : 90 - (y / 621) * 180,
    countryCode: info.value?.Host?.CountryCode?.toLowerCase() || '',
  };
});

const locations = computed(() => {
  const arr = [];
  if (serverLocation.value) {
    const {
      code,
      name,
      x,
      y,
    } = serverLocation.value;
    if (typeof x === 'number' && typeof y === 'number') {
      arr.push({
        key: code,
        x,
        y,
        code,
        size: 4,
        label: `${name}`,
        servers: [info.value],
      });
    }
  }
  return arr;
});

const showWorldMap = computed(() => {
  if (config.nazhua?.hideWorldMap) {
    return false;
  }
  if (config.nazhua?.hideDetailWorldMap) {
    return false;
  }
  if (info.value?.ID && locations.value.length === 0) {
    return false;
  }
  return true;
});

const worldMapPosition = computed(() => {
  if (Object.keys(config.nazhua).includes('detailWorldMapPosition')) {
    return config.nazhua.detailWorldMapPosition;
  }
  return 'top';
});

function handleWorldMapWidth() {
  const containerWidth = detailContainerRef.value?.offsetWidth;
  if (!containerWidth) {
    return;
  }
  const availableWidth = containerWidth - 40;
  worldMapWidth.value = Math.max(
    Math.min(
      availableWidth,
      window.innerWidth - 40,
      900,
    ),
    300, // 防止奇葩情况
  );
}

let resizeObserver = null;
function observeContainerSize() {
  if (resizeObserver || !detailContainerRef.value) {
    return;
  }
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      handleWorldMapWidth();
    });
    resizeObserver.observe(detailContainerRef.value);
  }
}

function unobserveContainerSize() {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
}

watch(() => info.value, async (newValue, oldValue) => {
  if (!oldValue && newValue && router.currentRoute.value.name === 'ServerDetail') {
    pageTitle(newValue?.Name, '节点详情');
    await nextTick();
    handleWorldMapWidth();
  }
});

watch(() => dataInit.value, () => {
  if (dataInit.value && !info.value) {
    router.replace({
      name: 'Home',
    });
  }
});

onMounted(() => {
  if (info.value) {
    pageTitle(info.value?.Name, '节点详情');
  }
  handleWorldMapWidth();
  observeContainerSize();
  window.addEventListener('resize', handleWorldMapWidth);
});

onActivated(() => {
  nextTick(() => {
    handleWorldMapWidth();
  });
});

onUnmounted(() => {
  unobserveContainerSize();
  window.removeEventListener('resize', handleWorldMapWidth);
});
</script>

<style lang="scss" scoped>
.detail-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: var(--detail-container-width);
  padding: 20px;
  margin: auto;

  &.server--offline {
    filter: grayscale(1);
  }
}
</style>
