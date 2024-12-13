<template>
  <dot-dot-box
    border-radius="var(--list-item-border-radius)"
    padding="var(--list-item-padding)"
    class="server-list-row-item"
    :class="{
      'server-list-row-item--offline': info.online === -1,
    }"
    @click="openDetail"
  >
    <div class="list-column-item list-column-item--server-flag">
      <span
        class="server-flag"
      >
        <span
          class="fi"
          :class="'fi-' + (info?.Host?.CountryCode || 'un')"
        />
      </span>
    </div>
    <div class="list-column-item list-column-item--server-name">
      <span
        class="server-name"
        :title="info.Name"
      >
        {{ info.Name }}
      </span>
    </div>
    <div class="list-column-item list-column-item--server-system">
      <span :class="platformLogoIconClassName" />
    </div>
    <div class="list-column-item list-column-item--cpu-mem">
      <span class="core-mem">{{ cpuAndMemAndDisk || '-' }}</span>
    </div>
    <server-list-item-status
      v-if="$config.nazhua.hideListItemStatusDonut !== true"
      :info="info"
    />
    <server-list-item-real-time
      v-if="$config.nazhua.hideListItemStat !== true"
      :info="info"
      server-real-time-list-tpls="load,inSpeed,outSpeed,transfer,duration"
    />
    <server-list-item-bill
      v-if="$config.nazhua.hideListItemBill !== true"
      :info="info"
    />
  </dot-dot-box>
</template>

<script setup>
/**
 * 单节点
 */

import {
  computed,
} from 'vue';
import {
  useRouter,
} from 'vue-router';
import * as hostUtils from '@/utils/host';

import handleServerInfo from '@/views/composable/server-info';
import ServerListItemStatus from './server-list-item-status.vue';
import ServerListItemRealTime from './server-list-item-real-time.vue';
import ServerListItemBill from './server-list-item-bill.vue';

const props = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
});

const router = useRouter();

/**
 * XCore XGB
 */
const { cpuAndMemAndDisk } = handleServerInfo({
  props,
});

const platformLogoIconClassName = computed(() => hostUtils.getPlatformLogoIconClassName(props.info?.Host?.Platform));

function openDetail() {
  router.push({
    name: 'ServerDetail',
    params: {
      serverId: props.info.ID,
    },
  });
}
</script>

<style lang="scss" scoped>
.server-list-row-item {
  --list-item-height: 64px;
  --list-item-border-radius: 8px;
  --list-item-gap: 10px;
  --list-item-padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--list-item-height);
  gap: var(--list-item-gap);
  transition: 0.3s;

  &--offline {
    filter: grayscale(1);
  }
}

.list-column-item {
  display: flex;
  align-items: center;
  overflow: hidden;

  &--server-flag {
    --server-flag-size: 24px;
    width: calc(var(--server-flag-size) * 1.5);
    .server-flag {
      width: calc(var(--server-flag-size) * 1.5);
      height: var(--server-flag-size);
      line-height: var(--server-flag-size);
      font-size: var(--server-flag-size);
    }
  }
  &--server-name {
    flex: 1;

    .server-name {
      height: 32px;
      line-height: 34px;
      font-size: 16px;
      width: 100%;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
  }
  &--server-system {
    width: 24px;
    justify-content: center;
    font-size: 24px;
  }
  &--cpu-mem {
    width: 100px;
    .core-mem {
      height: 30px;
      line-height: 32px;
      font-size: 16px;
      width: 100%;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    // 针对1440px以下的屏幕
    @media screen and (max-width: 1440px) {
      width: 80px;
    }
  }
}
</style>
