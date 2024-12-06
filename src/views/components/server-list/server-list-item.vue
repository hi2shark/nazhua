<template>
  <dot-dot-box
    border-radius="var(--list-item-border-radius)"
    :padding="0"
    class="server-list-item"
    :class="{
      'server-list-item--offline': info.online === -1,
    }"
  >
    <div
      class="server-info-group server-list-item-head"
      :class="{
        'dot-dot-box--hide': $config.nazhua?.hideDotBG === true,
      }"
      @click="openDetail"
    >
      <div class="server-name-group left-box">
        <span
          class="server-flag"
        >
          <span
            class="fi"
            :class="'fi-' + (info?.Host?.CountryCode || 'un')"
          />
        </span>
        <span class="server-name">
          {{ info.Name }}
        </span>
      </div>
      <div class="right-box">
        <div
          v-if="cpuAndMemAndDisk"
          class="cpu-mem-group"
        >
          <span
            v-if="info?.Host?.Platform"
            :class="'fl-' + info?.Host?.Platform"
          />
          <span class="core-mem">{{ cpuAndMemAndDisk }}</span>
        </div>
      </div>
    </div>
    <div
      v-if="showStatus || showStatus"
      class="server-list-item-main"
      @click="openDetail"
    >
      <server-list-item-status
        v-if="showStatus"
        :info="info"
      />
      <server-real-time
        v-if="showStat"
        :info="info"
      />
    </div>
    <server-list-item-bill
      v-if="showBill"
      :info="info"
    />
  </dot-dot-box>
</template>

<script setup>
/**
 * 单节点
 */

import {
  useRouter,
} from 'vue-router';

import config from '@/config';

import handleServerInfo from '@/views/composable/server-info';
import ServerRealTime from '@/views/components/server/server-real-time.vue';
import ServerListItemStatus from './server-list-item-status.vue';
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

function openDetail() {
  router.push({
    name: 'ServerDetail',
    params: {
      serverId: props.info.ID,
    },
  });
}

const showStatus = config.nazhua.hideListItemStatusDonut !== true;
const showStat = config.nazhua.hideListItemStat !== true;
const showBill = config.nazhua.hideListItemBill !== true;
</script>

<style lang="scss" scoped>
.server-list-item {
  --list-item-border-radius: 12px;
  width: var(--list-item-width);
  color: #fff;
  transition: 0.3s;

  .server-info-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding: 0 15px;
    height: 50px;
    border-top-left-radius: var(--list-item-border-radius);
    border-top-right-radius: var(--list-item-border-radius);
    background: rgba(#000, 0.3);
    box-shadow: 0 2px 4px rgba(#000, 0.5);
    cursor: pointer;

    @media screen and (max-width: 768px) {
      cursor: default;
    }

    &.dot-dot-box--hide {
      box-shadow: none;
      border-bottom: 1px solid rgba(#ddd, 0.1);
    }

    &.server-list-item-head {
      flex-wrap: wrap;
      overflow: hidden;
    }

    .left-box,
    .right-box {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: default;
    }

    .server-flag {
      width: calc(18px * 1.5);
      height: 30px;
      line-height: 30px;
      font-size: 18px;
      text-align: center;
    }

    .server-name {
      height: 30px;
      line-height: 32px;
      font-size: 14px;
    }

    .cpu-mem-group {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .core-mem {
      height: 30px;
      line-height: 32px;
    }
  }

  &.server-list-item--offline {
    filter: grayscale(1);
    .server-info-group {
      .server-name {
        color: #666;
      }
    }
  }
}

.server-list-item-main {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px 10px;

  --real-time-value-font-size: 24px;
  --real-time-text-font-size: 12px;
  --real-time-label-font-size: 14px;

  @media screen and (max-width: 1280px) {
    padding: 10px 0 15px;

    --real-time-value-font-size: 20px;
  }

  @media screen and (max-width: 1024px) {
    --real-time-value-font-size: 24px;
  }

  @media screen and (max-width: 800px) {
    --real-time-value-font-size: 20px;
  }

  @media screen and (max-width: 680px) {
    --real-time-value-font-size: 24px;
  }

  @media screen and (max-width: 320px) {
    --real-time-value-font-size: 20px;
  }
}
</style>
