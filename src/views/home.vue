<template>
  <div class="index-container">
    <div class="scroll-container">
      <div
        class="world-map-box"
      >
        <world-map
          v-if="showWorldMap"
          :locations="serverLocations || []"
          :width="worldMapWidth"
        />
      </div>
      <div
        v-if="showFilter"
        class="fitler-group"
      >
        <div class="left-box">
          <server-option-box
            v-if="showTag && tagOptions.length"
            v-model="filterFormData.tag"
            :options="tagOptions"
          />
        </div>
        <div class="right-box">
          <server-option-box
            v-if="onlineOptions.length"
            v-model="filterFormData.online"
            :options="onlineOptions"
          />
        </div>
      </div>
      <transition-group
        name="list"
        tag="div"
        class="server-list-container"
      >
        <server-item
          v-for="item in filterServerList"
          :key="item.ID"
          :info="item"
        />
      </transition-group>
    </div>
  </div>
</template>

<script setup>
/**
 * 首页
 */

import {
  ref,
  computed,
  onMounted,
  onUnmounted,
} from 'vue';
import {
  useStore,
} from 'vuex';

import config from '@/config';
import {
  alias2code,
  locationCode2Info,
  count2size,
} from '@/utils/world-map-location';
import uuid from '@/utils/uuid';

import WorldMap from '@/components/world-map/world-map.vue';
import ServerOptionBox from './components/server-list/server-option-box.vue';
import ServerItem from './components/server-list/server-list-item.vue';

const store = useStore();
const worldMapWidth = ref();

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

const tagOptions = computed(() => store.state.serverGroup.map((i) => ({
  key: uuid(),
  label: i.name,
  value: i.name,
})));

const onlineOptions = computed(() => {
  if (serverCount.value?.total !== serverCount.value?.online) {
    return [{
      key: 'online',
      label: '在线',
      value: '1',
    }, {
      key: 'offline',
      label: '离线',
      value: '-1',
    }];
  }
  return [];
});

const filterServerList = computed(() => serverList.value.filter((i) => {
  const isFilterArr = [];
  if (filterFormData.value.tag) {
    isFilterArr.push(i.Tag === filterFormData.value.tag);
  }
  if (filterFormData.value.online) {
    isFilterArr.push(i.online === (filterFormData.value.online * 1));
  }
  return isFilterArr.length ? isFilterArr.every((o) => o) : true;
}));

/**
 * 解构服务器列表的位置数据
 */
const serverLocations = computed(() => {
  const locationMap = {};
  filterServerList.value.forEach((i) => {
    if (i.online === -1) {
      return;
    }
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
        locationMap[code] = 0;
      }
      locationMap[code] += 1;
    }
  });
  const locations = [];
  Object.entries(locationMap).forEach(([code, count]) => {
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
        size: count2size(count),
        label: `${name},${count}台`,
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

/**
 * 处理窗口大小变化
 */
function handleResize() {
  worldMapWidth.value = document.querySelector('.server-list-container').clientWidth - 40;
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
.index-container {
  width: 100%;
  height: 100%;

  --list-padding: 20px;
  --list-gap-size: 20px;
  --list-item-num: 3;
  --list-item-width: calc(
    (
      var(--list-container-width)
      - (var(--list-padding) * 2)
      - (
        var(--list-gap-size)
        * (var(--list-item-num) - 1)
        )
    )
    / var(--list-item-num)
  );

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
  .server-list-container {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: var(--list-gap-size);
    padding: 0 var(--list-padding);
    width: var(--list-container-width);
    margin: auto;
  }

  // 针对1440px以下的屏幕
  @media screen and (max-width: 1440px) {
    --list-gap-size: 10px;
  }

  @media screen and (max-width: 1024px) {
    --list-item-num: 2;
  }

  @media screen and (max-width: 680px) {
    --list-item-num: 1;
  }
}

.fitler-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px 20px;
  width: var(--list-container-width);
  margin: auto;
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
.list-leave-active {
  position: absolute;
}
</style>
