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
        :class="{
          'list-is-row': showListRow,
          'list-is-card': showListCard,
        }"
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
        v-if="showListRow"
        name="list"
        tag="div"
        class="server-list-container"
        :class="`server-list--row`"
      >
        <server-row-item
          v-for="item in filterServerList.list"
          :key="item.ID"
          :info="item"
        />
      </transition-group>
      <transition-group
        v-if="showListCard"
        name="list"
        tag="div"
        class="server-list-container"
        :class="`server-list--card`"
      >
        <server-card-item
          v-for="item in filterServerList.list"
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
  provide,
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
} from '@/utils/world-map';
import uuid from '@/utils/uuid';
import validate from '@/utils/validate';

import WorldMap from '@/components/world-map/world-map.vue';
import ServerOptionBox from './components/server-list/server-option-box.vue';
import ServerCardItem from './components/server-list/card/server-list-item.vue';
import ServerRowItem from './components/server-list/row/server-list-item.vue';

const store = useStore();
const worldMapWidth = ref();
const windowWidth = ref(window.innerWidth);

const showListRow = computed(() => {
  if (windowWidth.value > 1024) {
    return config.nazhua.listServerItemType === 'row';
  }
  return false;
});
const showListCard = computed(() => {
  if (windowWidth.value > 1024) {
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

const tagOptions = computed(() => store.state.serverGroup.map((i) => ({
  key: uuid(),
  label: i.name,
  value: i.name,
  title: `${i.servers.length}台`,
})));

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
      if (validate.isSet(customData?.orderLink)) {
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
}

.fitler-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px 20px;
  width: var(--list-container-width);
  margin: auto;

  &.list-is-card {
    padding: 0 20px;
  }
}

.server-list-container.server-list--card {
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
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: var(--list-gap-size);
  padding: 0 var(--list-padding);
  width: var(--list-container-width);
  margin: auto;

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

.server-list-container.server-list--row {
  --list-padding: 20px;
  --list-gap-size: 12px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--list-gap-size);
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
