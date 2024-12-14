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
    <div class="row-left-box">
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
      <server-list-column
        prop="server-flag"
        label="地区"
        :value="info?.Host?.CountryCode?.toUpperCase() || 'UN'"
      />
      <server-list-column
        prop="server-system"
        label="系统"
        :value="platformSystemLabel || '-'"
      />
      <server-list-column
        prop="cpu-mem"
        label="配置"
        width="80"
        :value="cpuAndMemAndDisk || '-'"
      />
    </div>
    <div class="row-center-box">
      <server-list-item-status
        v-if="$config.nazhua.hideListItemStatusDonut !== true"
        :info="info"
      />
    </div>
    <div class="row-right-box">
      <server-list-item-real-time
        v-if="$config.nazhua.hideListItemStat !== true"
        :info="info"
        server-real-time-list-tpls="load,inSpeed,outSpeed,transfer,duration"
      />
      <server-list-item-bill
        v-if="$config.nazhua.hideListItemBill !== true"
        :info="info"
      />
    </div>
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
import ServerListColumn from './server-list-column.vue';
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

const platformSystemLabel = computed(() => hostUtils.getSystemOSLabel(props.info?.Host?.Platform));

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
  --list-item-padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--list-item-height);
  gap: var(--list-item-gap);
  transition: 0.3s;

  &--offline {
    filter: grayscale(1);
  }

  .row-left-box,
  .row-center-box,
  .row-right-box {
    display: flex;
    align-items: center;
    gap: var(--list-item-gap);
  }

  .row-left-box,
  .row-right-box {
    flex: 1;
  }
  .row-right-box {
    justify-content: flex-end;
  }
  .row-center-box {
    justify-content: center;
  }
}

.list-column-item {
  display: flex;
  align-items: center;
  overflow: hidden;

  &--server-flag {
    --server-flag-size: 24px;
    width: calc(var(--server-flag-size) * 1.5);
    margin-left: 20px;
    .server-flag {
      width: calc(var(--server-flag-size) * 1.5);
      height: var(--server-flag-size);
      line-height: var(--server-flag-size);
      font-size: var(--server-flag-size);
    }
  }
  &--server-name {
    width: 200px;

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
}
</style>
