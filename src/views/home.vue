<template>
  <div class="index-container">
    <div class="scroll-container">
      <div
        v-if="worldMapPosition === 'top' && showWorldMap"
        class="world-map-box top-world-map"
      >
        <world-map
          :locations="serverLocations || []"
          :width="worldMapWidth"
        />
      </div>
      <div
        v-if="showFilter"
        class="fitler-group"
        :class="{
          'list-is-row': showListRow,
          'list-is-card': showListCard,
        }"
      >
        <div class="left-box">
          <server-option-box
            v-if="showTag && serverGroupOptions.length"
            v-model="filterFormData.tag"
            :options="serverGroupOptions"
          />
        </div>
        <div class="right-box">
          <server-option-box
            v-if="onlineOptions.length"
            v-model="filterFormData.online"
            :options="onlineOptions"
          />
          <server-option-box
            v-if="config.nazhua.listServerItemTypeToggle"
            v-model="listType"
            :options="listTypeOptions"
            :accpet-empty="false"
            :mobile-show="false"
          />
        </div>
      </div>
      <server-list-warp
        v-if="showListRow"
        :show-transition="showTransition"
        :show-list-row="showListRow"
      >
        <server-row-item
          v-for="item in filterServerList.list"
          :key="item.ID"
          :info="item"
        />
      </server-list-warp>
      <server-list-warp
        v-if="showListCard"
        :show-transition="showTransition"
        :show-list-card="showListCard"
      >
        <server-card-item
          v-for="item in filterServerList.list"
          :key="item.ID"
          :info="item"
        />
      </server-list-warp>
      <div
        v-if="worldMapPosition === 'bottom' && showWorldMap"
        class="world-map-box bottom-world-map"
      >
        <world-map
          :locations="serverLocations || []"
          :width="worldMapWidth"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 首页
 */

import {
  ref,
  provide,
  computed,
  onMounted,
  onUnmounted,
  onActivated,
  onDeactivated,
  nextTick,
  watch,
} from 'vue';
import {
  useStore,
} from 'vuex';

import config from '@/config';
import {
  alias2code,
  locationCode2Info,
  count2size,
} from '@/utils/world-map';
import uuid from '@/utils/uuid';
import validate from '@/utils/validate';

import WorldMap from '@/components/world-map/world-map.vue';
import ServerOptionBox from './components/server-list/server-option-box.vue';
import ServerListWarp from './components/server-list/server-list-warp.vue';
import ServerCardItem from './components/server-list/card/server-list-item.vue';
import ServerRowItem from './components/server-list/row/server-list-item.vue';

const store = useStore();
const worldMapWidth = ref();
const windowWidth = ref(window.innerWidth);

const listType = ref(config.nazhua.listServerItemType || 'card');

const showTransition = computed(() => {
  // 强制开启
  if (config.nazhua.forceTransition) {
    return true;
  }
  // 安卓设备不开启 -> 部分安卓浏览器渲染动画会卡顿
  if (window.navigator.userAgent.includes('Android')) {
    return false;
  }
  // 服务器数量小于7时，不开启
  return store.state.serverList.length < 7;
});
const showListRow = computed(() => {
  if (windowWidth.value > 1024) {
    if (config.nazhua.listServerItemTypeToggle) {
      return listType.value === 'row';
    }
    return config.nazhua.listServerItemType === 'row';
  }
  return false;
});
const showListCard = computed(() => {
  if (windowWidth.value > 1024) {
    if (config.nazhua.listServerItemTypeToggle) {
      return listType.value !== 'row';
    }
    return config.nazhua.listServerItemType !== 'row';
  }
  return true;
});

const showFilter = computed(() => config.nazhua.hideFilter !== true);
const filterFormData = ref({
  tag: '',
  online: '',
});
// 是否显示标签
const showTag = computed(() => {
  if (config.nazhua.hideGroup === true) {
    return false;
  }
  // hideTag与hideGroup是相同的配置，兼容旧版
  if (config.nazhua.hideTag === true) {
    return false;
  }
  return true;
});

// 服务器列表
const serverList = computed(() => store.state.serverList);
// 服务器总数
const serverCount = computed(() => store.state.serverCount);
// 分组标签
const serverGroupOptions = computed(() => {
  const options = [];
  store.state.serverGroup.forEach((i) => {
    if (i.servers && i.servers.length > 0) {
      options.push({
        key: uuid(),
        label: i.name,
        value: i.name,
        title: `${i.servers.length}台`,
      });
    }
  });
  return options;
});

const onlineOptions = computed(() => {
  if (serverCount.value?.total !== serverCount.value?.online) {
    return [{
      key: 'online',
      label: '在线',
      value: '1',
      title: `${serverCount.value.online}台`,
    }, {
      key: 'offline',
      label: '离线',
      value: '-1',
      title: `${serverCount.value.offline}台`,
    }];
  }
  return [];
});

/**
 * 筛选离线时，离线数量变为0时，自动清空在线筛选
 */
watch(() => serverCount.value, () => {
  if (filterFormData.value.online === '-1' && serverCount.value.offline === 0) {
    filterFormData.value.online = '';
  }
  if (filterFormData.value.online === '1' && serverCount.value.online === 0) {
    filterFormData.value.online = '';
  }
}, {
  immediate: true,
});

const listTypeOptions = computed(() => [{
  key: 'card',
  label: '卡片',
  value: 'card',
  icon: 'ri-gallery-view-2',
}, {
  key: 'row',
  label: '列表',
  value: 'row',
  icon: 'ri-list-view',
}]);

const filterServerList = computed(() => {
  const fields = {};
  const locationMap = {};

  const list = serverList.value.filter((i) => {
    const isFilterArr = [];
    if (filterFormData.value.tag) {
      const group = store.state.serverGroup.find((o) => o.name === filterFormData.value.tag);
      isFilterArr.push((group?.servers || []).includes(i.ID));
    }
    if (filterFormData.value.online) {
      isFilterArr.push(i.online === (filterFormData.value.online * 1));
    }
    const status = isFilterArr.length ? isFilterArr.every((o) => o) : true;
    if (!status) {
      return false;
    }

    // 判断是否有字段
    if (i.PublicNote) {
      const {
        billingDataMod,
        planDataMod,
        customData,
      } = i.PublicNote;
      if (validate.isSet(billingDataMod?.amount)) {
        fields.billing = true;
      }
      if (validate.isSet(billingDataMod?.endDate)) {
        fields.remainingTime = true;
      }
      if (validate.isSet(planDataMod?.bandwidth)) {
        fields.bandwidth = true;
      }
      if (validate.isSet(customData?.orderLink) && config.nazhua.hideListItemLink !== true) {
        fields.orderLink = true;
      }
    }

    // 位置
    if (i.online === 1) {
      let aliasCode;
      let locationCode;
      if (i?.PublicNote?.customData?.location) {
        aliasCode = i.PublicNote.customData.location;
        locationCode = i.PublicNote.customData.location;
      } else if (i?.Host?.CountryCode) {
        aliasCode = i.Host.CountryCode.toUpperCase();
      }
      const code = alias2code(aliasCode) || locationCode;
      if (code) {
        if (!locationMap[code]) {
          locationMap[code] = [];
        }
        locationMap[code].push(i);
      }
    }

    return true;
  });
  return {
    fields,
    list,
    locationMap,
  };
});
provide('filterServerList', filterServerList);

/**
 * 解构服务器列表的位置数据
 */
const serverLocations = computed(() => {
  const locations = [];
  Object.entries(filterServerList.value.locationMap).forEach(([code, servers]) => {
    const {
      x,
      y,
      name,
    } = locationCode2Info(code) || {};
    if (x && y) {
      locations.push({
        key: code,
        x,
        y,
        code,
        size: count2size(servers.length),
        label: `${name},${servers.length}台`,
        servers,
      });
    }
  });
  return locations;
});

const showWorldMap = computed(() => {
  if (config.nazhua?.hideWorldMap) {
    return false;
  }
  if (config.nazhua?.hideHomeWorldMap) {
    return false;
  }
  if (serverList.value.length > 0 && serverLocations.value.length === 0) {
    return false;
  }
  return true;
});

const worldMapPosition = computed(() => {
  if (Object.keys(config.nazhua).includes('homeWorldMapPosition')) {
    return config.nazhua.homeWorldMapPosition;
  }
  return 'top';
});

/**
 * 处理窗口大小变化
 */
function handleResize() {
  worldMapWidth.value = document.querySelector('.server-list-container').clientWidth - 40;
  windowWidth.value = window.innerWidth;
}

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const scrollPosition = ref(0);

onDeactivated(() => {
  // 保存滚动位置
  scrollPosition.value = document.documentElement.scrollTop || document.body.scrollTop;
});

onActivated(() => {
  // 如果有保存的位置，则恢复到该位置
  if (scrollPosition.value > 0) {
    nextTick(() => {
      window.scrollTo({
        top: scrollPosition.value,
        behavior: 'instant',
      });
    });
  }
});
</script>

<style lang="scss" scoped>
.index-container {
  width: 100%;
  height: 100%;

  .scroll-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px 0;
  }

  .world-map-box {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bottom-world-map {
    margin-top: 30px;
  }
}

.fitler-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px 20px;
  width: var(--list-container-width);
  padding: 0 20px;
  margin: auto;

  .left-box {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .right-box {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>
