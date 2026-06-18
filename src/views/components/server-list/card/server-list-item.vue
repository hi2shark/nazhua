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
        <server-flag :info="info" />
        <span class="server-name">
          {{ info.Name }}
        </span>
        <div
          v-if="cpuAndMemAndDisk"
          class="cpu-mem-group"
        >
          <span :class="platformLogoIconClassName" />
          <span class="core-mem">{{ cpuAndMemAndDisk }}</span>
        </div>
      </div>
    </div>
    <div
      v-if="$config.nazhua.hideListItemStatusDonut !== true && $config.nazhua.hideListItemStat !== true"
      class="server-list-item-main"
      @click="openDetail"
    >
      <server-list-item-status
        v-if="$config.nazhua.hideListItemStatusDonut !== true"
        :info="info"
      />
      <server-real-time
        v-if="$config.nazhua.hideListItemStat !== true"
        :info="info"
        :server-real-time-list-tpls="serverRealTimeListTpls"
        :transfer-replace="transferReplace"
      />
    </div>
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
  inject,
} from 'vue';
import {
  useRouter,
} from 'vue-router';
import config from '@/config';
import * as hostUtils from '@/utils/host';
import {
  getCycleTransferSummaryByServer,
} from '@/utils/cycle-transfer';

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

const platformLogoIconClassName = computed(() => hostUtils.getPlatformLogoIconClassName(props.info?.Host?.Platform));

const listCycleTransferMap = inject('listCycleTransferMap', {
  value: {},
});
const cycleTransferSummary = computed(() => getCycleTransferSummaryByServer(listCycleTransferMap.value, props.info));

const transferReplace = computed(() => {
  const summary = cycleTransferSummary.value;
  if (!summary?.remainingDisplay || summary.remainingDisplay === '-') {
    return null;
  }
  const matched = String(summary.remainingDisplay).match(/^([0-9]+(?:\.[0-9]+)?)\s*([A-Za-z]+)$/);
  if (!matched) {
    return null;
  }
  const [, value, unit] = matched;
  return {
    label: '剩余流量',
    value: Number(value),
    unit,
  };
});

const serverRealTimeListTpls = computed(() => {
  if (config.nazhua?.listServerRealTimeShowLoad || config.nazhua.listServerItemType === 'server-status') {
    return 'D-A-T,T-A-U,L-A-P,I-A-O';
  }
  return 'duration,transfer,inSpeed,outSpeed';
});

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
.server-list-item {
  --list-item-border-radius: 12px;
  width: var(--list-item-width);
  color: #fff;
  transition: 0.3s;

  .server-info-group {
    --list-item-head-height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding: 0 15px;
    border-top-left-radius: var(--list-item-border-radius);
    border-top-right-radius: var(--list-item-border-radius);
    background: rgba(#000, 0.3);
    box-shadow: 0 2px 4px rgba(#000, 0.5);
    cursor: pointer;

    @media screen and (max-width: 768px) {
      cursor: default;
      --list-item-head-height: 40px;
    }

    &.dot-dot-box--hide {
      box-shadow: none;
      border-bottom: 1px solid rgba(#ddd, 0.1);
    }

    &.server-list-item-head {
      flex-wrap: wrap;
      overflow: hidden;
      height: var(--list-item-head-height, 50px);
    }

    .left-box {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
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
      flex: 0 1 auto;
      min-width: 0;
      height: 30px;
      line-height: 32px;
      font-size: 14px;
      font-weight: bold;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .cpu-mem-group {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0 8px;
      height: 24px;
      line-height: 24px;
      border-radius: 4px;
      background: rgba(#000, 0.35);
      border: 1px solid rgba(#fff, 0.08);
      color: #8fdfff;
    }

    .core-mem {
      height: 24px;
      line-height: 24px;
      font-size: 12px;
      font-weight: bold;
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

  font-size: var(--real-time-label-font-size);

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

  @media screen and (max-width: 720px) {
    --real-time-value-font-size: 24px;
    --real-time-text-font-size: 12px;
    --real-time-label-font-size: 12px;

    padding: 5px 0;
  }

  @media screen and (max-width: 320px) {
    --real-time-value-font-size: 20px;
  }
}
</style>
