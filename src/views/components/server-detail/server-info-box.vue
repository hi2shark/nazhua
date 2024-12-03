<template>
  <div class="server-info-box">
    <div
      v-if="billPlanData.length"
      class="server-info-group server-info--biil-plan"
    >
      <div class="server-info-label">
        套餐
      </div>
      <div class="server-info-content">
        <span class="server-info-item-group">
          <span
            v-for="item in billPlanData"
            :key="item.label"
            class="server-info-item"
          >
            <span
              v-if="item.label"
              class="server-info-item-label"
            >{{ item.label }}</span>
            <span class="server-info-item-value">{{ item.value }}</span>
          </span>
          <div
            v-if="showBuyBtn"
            class="buy-btn"
            @click.stop="toBuy"
          >
            <span class="icon">
              <span class="ri-shopping-bag-3-line" />
            </span>
            <span class="text">{{ buyBtnText }}</span>
          </div>
        </span>
      </div>
    </div>
    <div class="server-info-group server-info--cpu">
      <div class="server-info-label">
        平台
      </div>
      <div class="server-info-content">
        <span
          class="cpu-info"
          :title="info?.Host?.CPU?.[0]"
        >
          <span>{{ info?.Host?.CPU?.[0] }}</span>
        </span>
      </div>
    </div>
    <div class="server-info-group server-info--system-os">
      <div class="server-info-label">
        系统
      </div>
      <div class="server-info-content">
        <span class="server-info-item">
          <span class="server-info-item-label">{{ systemOSLabel }}</span>
          <span
            v-if="info?.Host?.PlatformVersion"
            class="server-info-item-value"
          >
            {{ info?.Host?.PlatformVersion }}
          </span>
        </span>
      </div>
    </div>
    <div class="server-info-group server-info--load">
      <div class="server-info-label">
        占用
      </div>
      <div class="server-info-content">
        <span class="server-info-item-group">
          <span class="server-info-item process-count">
            <span class="server-info-item-label">进程数</span>
            <span class="server-info-item-value">{{ processCount }}</span>
          </span>
          <span class="server-info-item load">
            <span class="server-info-item-label">负载</span>
            <span class="server-info-item-value">
              {{ info?.State?.Load1 }},{{ info?.State?.Load5 }},{{ info?.State?.Load15 }}
            </span>
          </span>
        </span>
      </div>
    </div>
    <div class="server-info-group server-info--transfer">
      <div class="server-info-label">
        流量
      </div>
      <div class="server-info-content">
        <span class="server-info-item-group">
          <span class="server-info-item transfer--in">
            <span class="server-info-item-label">入网</span>
            <span class="server-info-item-value">{{ transfer?.in?.value }}{{ transfer?.in?.symbol }}</span>
          </span>
          <span class="server-info-item transfer--out">
            <span class="server-info-item-label">出网</span>
            <span class="server-info-item-value">{{ transfer?.out?.value }}{{ transfer?.out?.symbol }}</span>
          </span>
        </span>
      </div>
    </div>
    <div class="server-info-group server-info--conn">
      <div class="server-info-label">
        连接
      </div>
      <div class="server-info-content">
        <span class="server-info-item-group">
          <span class="server-info-item conn--tcp">
            <span class="server-info-item-label">TCP</span>
            <span class="server-info-item-value">{{ tcpConnCount }}</span>
          </span>
          <span class="server-info-item conn--tcp">
            <span class="server-info-item-label">UDP</span>
            <span class="server-info-item-value">{{ udpConnCount }}</span>
          </span>
        </span>
      </div>
    </div>
    <div class="server-info-group server-info--boottime">
      <div class="server-info-label">
        启动
      </div>
      <div class="server-info-content">
        <span class="server-info-item runtime--boottime">
          <span class="server-info-item-value">{{ bootTime }}</span>
        </span>
      </div>
    </div>
    <div class="server-info-group server-info--lasttime">
      <div class="server-info-label">
        活跃
      </div>
      <div class="server-info-content">
        <span class="server-info-item runtime--lasttime">
          <span class="server-info-item-value">{{ lastActive }}</span>
        </span>
      </div>
    </div>
    <div
      v-if="tagList?.length"
      class="server-info-group server-info--tag-list"
    >
      <div class="server-info-label">
        标签
      </div>
      <div class="server-info-content">
        <div class="server-info-tag-list">
          <span
            v-for="(tag, index) in tagList"
            :key="`${tag}_${index}`"
            class="server-info-tag-item"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 服务器信息盒子
 */
import {
  computed,
} from 'vue';
import dayjs from 'dayjs';
import config from '@/config';
import * as hostUtils from '@/utils/host';

import handleServerBillAndPlan from '@/views/composable/server-bill-and-plan';

const props = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
});

const buyBtnText = config.nazhua.buyBtnText || '购买';
const showBuyBtn = computed(() => !!props.info?.PublicNote?.customData?.orderLink);

function toBuy() {
  window.open(props.info?.PublicNote?.customData?.orderLink);
}

const {
  billAndPlan,
} = handleServerBillAndPlan({
  props,
});

const billPlanData = computed(() => ['billing', 'remainingTime', 'bandwidth', 'traffic'].map((i) => {
  if (billAndPlan.value[i]) {
    return {
      label: billAndPlan.value[i].label,
      value: billAndPlan.value[i].value,
    };
  }
  return null;
}).filter((i) => i));

const tagList = computed(() => {
  const list = [];
  if (props?.info?.PublicNote?.planDataMod?.networkRoute) {
    list.push(...props.info.PublicNote.planDataMod.networkRoute.split(','));
  }
  if (props?.info?.PublicNote?.planDataMod?.extra) {
    list.push(...props.info.PublicNote.planDataMod.extra.split(','));
  }
  return list;
});

const systemOSLabel = computed(() => {
  if (props?.info?.Host?.Platform) {
    return hostUtils.getSystemOSLabel(props.info.Host.Platform);
  }
  return '';
});

const bootTime = computed(() => {
  if (props?.info?.Host?.BootTime) {
    return dayjs(props.info.Host.BootTime * 1000).format('YYYY.MM.DD HH:mm:ss');
  }
  return '-';
});

const lastActive = computed(() => {
  if (props?.info?.Host?.BootTime && props?.info?.LastActive) {
    return dayjs(props.info.LastActive).format('YYYY.MM.DD HH:mm:ss');
  }
  return '-';
});

/**
 * 计算流量
 */
const transfer = computed(() => {
  const stats = {
    in: 0,
    out: 0,
    total: 0,
  };
  if (props?.info?.State?.NetInTransfer) {
    stats.total += props.info.State.NetInTransfer;
    stats.in = props.info.State.NetInTransfer;
  }
  if (props?.info?.State?.NetOutTransfer) {
    stats.total += props.info.State.NetOutTransfer;
    stats.out = props.info.State.NetOutTransfer;
  }
  const result = {
    in: hostUtils.calcTransfer(stats.in),
    out: hostUtils.calcTransfer(stats.out),
    total: hostUtils.calcTransfer(stats.total),
    stats,
  };
  return result;
});

const tcpConnCount = computed(() => props.info?.State?.TcpConnCount);
const udpConnCount = computed(() => props.info?.State?.UdpConnCount);
const processCount = computed(() => props.info?.State?.ProcessCount);
</script>

<style lang="scss" scoped>
.server-info-box {
  --server-info-item-size: 24px;

  padding: 20px;
  color: #eee;
  border-radius: 12px;
  background-image: radial-gradient(transparent 1px, rgba(#000, 0.6) 1px);
  background-size: 3px 3px;
  backdrop-filter: saturate(50%) blur(3px);
  box-shadow: 2px 4px 6px rgba(#000, 0.4);

  @media screen and (max-width: 768px) {
    background-color: rgba(#000, 0.8);
    background-image: none;
    backdrop-filter: none;
  }
  @media screen and (max-width: 480px) {
    --server-info-item-size: 30px;
  }

  .server-info-group {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    font-size: 14px;

    .server-info-label {
      line-height: var(--server-info-item-size);
      color: #ccc;
    }

    .server-info-content {
      flex: 1;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      line-height: 18px;
      text-align: right;
      cursor: default;
    }
  }

  .server-info-item-group {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 0 12px;
  }

  .server-info-item {
    display: flex;
    gap: 0.2em;
  }

  .server-info-item-value {
    color: #a1eafb;
  }

  .transfer--total {
    .server-info-item-value {
      color: #fdfdfd;
    }
  }

  .buy-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    line-height: 18px;
    font-weight: bold;
    color: var(--list-item-buy-link-color);
    cursor: pointer;

    @media screen and (max-width: 768px) {
      cursor: default;
    }
  }

  .server-info-tag-list {
    display: flex;
    gap: 6px;

    .server-info-tag-item {
      height: 18px;
      padding: 0 4px;
      line-height: 18px;
      font-size: 12px;
      color: #111;
      background-color: rgba(#fff, 0.8);
      border-radius: 4px;
    }
  }
}
</style>
