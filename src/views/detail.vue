<template>
  <div
    v-if="info"
    class="detail-container"
    :class="{
      'server--offline': info?.online !== 1,
    }"
  >
    <world-map
      v-if="showWorldMap"
      :width="worldMapWidth"
      :locations="locations"
    />
    <server-name
      :key="`${info.ID}_name`"
      :info="info"
    />
    <server-status-box
      :key="`${info.ID}_status`"
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
  watch,
} from 'vue';
import {
  useStore,
} from 'vuex';
import {
  useRouter,
} from 'vue-router';
import {
  useI18n,
} from 'vue-i18n';

import config from '@/config';
import {
  alias2code,
  locationCode2Info,
} from '@/utils/world-map';
import pageTitle from '@/utils/page-title';

import WorldMap from '@/components/world-map/world-map.vue';
import ServerName from './components/server-detail/server-name.vue';
import ServerStatusBox from './components/server-detail/server-status-box.vue';
import ServerInfoBox from './components/server-detail/server-info-box.vue';
import ServerMonitor from './components/server-detail/server-monitor.vue';

const i18n = useI18n();

const props = defineProps({
  serverId: {
    type: [String, Number],
    default: null,
  },
});

const store = useStore();
const router = useRouter();

const worldMapWidth = ref(900);
const info = computed(() => store.state?.serverList?.find?.((i) => +i.ID === +props.serverId));
const dataInit = computed(() => store.state.init);

const locations = computed(() => {
  const arr = [];
  let aliasCode;
  let locationCode;
  if (info?.value?.PublicNote?.customData?.location) {
    aliasCode = info?.value?.PublicNote?.customData?.location;
    locationCode = info?.value?.PublicNote?.customData?.location;
  } else if (info?.value?.Host?.CountryCode) {
    aliasCode = info.value.Host.CountryCode.toUpperCase();
  }
  const code = alias2code(aliasCode) || locationCode;
  if (code) {
    const {
      x,
      y,
      name,
    } = locationCode2Info(code) || {};
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

function handleWorldMapWidth() {
  worldMapWidth.value = Math.max(
    Math.min(
      document.querySelector('.detail-container')?.offsetWidth - 40,
      window.innerWidth - 40,
      900,
    ),
    300, // 防止奇葩情况
  );
}

watch(() => info.value, (oldValue, newValue) => {
  if (!oldValue && newValue && router.currentRoute.value.name === 'ServerDetail') {
    pageTitle(newValue?.Name, i18n.t('serverDetail'));
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
    pageTitle(info.value?.Name, i18n.t('serverDetail'));
    handleWorldMapWidth();
  }
  window.addEventListener('resize', handleWorldMapWidth);
});

onUnmounted(() => {
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
