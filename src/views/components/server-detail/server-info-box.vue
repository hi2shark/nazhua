<template>
  <dot-dot-box class="server-info-box">
    <div class="server-info-group server-info--cpu">
      <div class="server-info-label">
        CPU
      </div>
      <div class="server-info-content">
        <template v-if="info?.Host?.CPU?.length === 1">
          <span
            class="cpu-info"
            :title="info.Host.CPU[0]"
          >
            <span>{{ info.Host.CPU[0] }}</span>
          </span>
        </template>
        <div
          v-else
          class="server-info-item-group"
        >
          <span
            v-for="(cpuItem, cpuIndex) in info.Host.CPU"
            :key="`${info.ID}_cpu_${cpuIndex}`"
            class="server-info-item"
          >
            <span class="server-info-item-label">CPU.{{ cpuIndex + 1 }}</span>
            <span class="server-info-item-value">{{ cpuItem }}</span>
          </span>
        </div>
      </div>
    </div>
    <div
      v-if="gpuList.length"
      class="server-info-group server-info--gpu"
    >
      <div class="server-info-label">
        GPU
      </div>
      <div class="server-info-content">
        <template v-if="gpuList.length === 1">
          <span
            class="gpu-info"
            :title="gpuList[0]"
          >
            <span>{{ gpuList[0] }}</span>
          </span>
        </template>
        <div
          v-else
          class="server-info-item-group"
        >
          <span
            v-for="(gpuItem, gpuIndex) in gpuList"
            :key="`${info.ID}_gpu_${gpuIndex}`"
            class="server-info-item"
          >
            <span class="server-info-item-label">GPU.{{ gpuIndex + 1 }}</span>
            <span class="server-info-item-value">{{ gpuItem }}</span>
          </span>
        </div>
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
        <div class="server-info-item-group">
          <span class="server-info-item process-count">
            <span class="server-info-item-label">进程数</span>
            <span class="server-info-item-value">{{ processCount }}</span>
          </span>
          <span class="server-info-item load">
            <span class="server-info-item-label">负载</span>
            <span class="server-info-item-value">
              {{ sysLoadInfo }}
            </span>
          </span>
        </div>
      </div>
    </div>
    <div class="server-info-group server-info--transfer">
      <div class="server-info-label">
        流量
      </div>
      <div class="server-info-content">
        <div class="server-info-item-group">
          <span class="server-info-item transfer--in">
            <span class="server-info-item-label">入网</span>
            <span class="server-info-item-value">
              <span class="text-value">{{ transfer?.in?.value }}</span>
              <span class="text-unit">{{ transfer?.in?.unit }}</span>
            </span>
          </span>
          <span class="server-info-item transfer--out">
            <span class="server-info-item-label">出网</span>
            <span class="server-info-item-value">
              <span class="text-value">{{ transfer?.out?.value }}</span>
              <span class="text-unit">{{ transfer?.out?.unit }}</span>
            </span>
          </span>
        </div>
      </div>
    </div>
    <div class="server-info-group server-info--conn">
      <div class="server-info-label">
        连接
      </div>
      <div class="server-info-content">
        <div class="server-info-item-group">
          <span class="server-info-item conn--tcp">
            <span class="server-info-item-label">TCP</span>
            <span class="server-info-item-value">{{ tcpConnCount }}</span>
          </span>
          <span class="server-info-item conn--tcp">
            <span class="server-info-item-label">UDP</span>
            <span class="server-info-item-value">{{ udpConnCount }}</span>
          </span>
        </div>
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
      v-if="billPlanData.length"
      class="server-info-group server-info--biil-plan"
    >
      <div class="server-info-label">
        套餐
      </div>
      <div class="server-info-content">
        <div class="server-info-item-group">
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
        </div>
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
    <div
      v-if="showBuyBtn"
      class="server-info-group server-info--order-link"
    >
      <div class="server-info-content">
        <div
          class="buy-btn"
          @click.stop="toBuy"
        >
          <span class="icon">
            <span class="ri-shopping-bag-3-line" />
          </span>
          <span class="text">{{ buyBtnText }}</span>
        </div>
      </div>
    </div>
  </dot-dot-box>
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

const buyBtnText = computed(() => config.nazhua.buyBtnText || '购买');
const showBuyBtn = computed(() => !!props.info?.PublicNote?.customData?.orderLink);

function toBuy() {
  const decodeUrl = decodeURIComponent(props.info?.PublicNote?.customData?.orderLink);
  window.open(decodeUrl, '_blank');
}

/**
 * GPU列表
 */
const gpuList = computed(() => {
  const gpus = props.info?.Host?.GPU || [];
  if (config.nazhua?.filterGPUKeywords?.length) {
    // 过滤奇怪的GPU，可以考虑过滤掉 Virtual Display
    const keywors = Array.isArray(config.nazhua.filterGPUKeywords)
      ? config.nazhua.filterGPUKeywords
      : [config.nazhua.filterGPUKeywords];
    return gpus.filter((i) => {
      if (keywors.length) {
        return !keywors.some((k) => i.toLowerCase().includes(k.toLowerCase()));
      }
      return true;
    });
  }
  return gpus;
});

const sysLoadInfo = computed(() => {
  if (props.info?.State?.Load1) {
    return [
      props.info.State?.Load1,
      props.info.State?.Load5,
      props.info.State?.Load15,
    ].filter((i) => i !== undefined).map((i) => (i).toFixed(2) * 1).join(',');
  }
  return '-';
});

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
      width: 2.4em;
      text-align: center;
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
    color: #00fff0;
  }

  .transfer--in {
    .server-info-item-value {
      color: #ddd;
    }
    .text-value {
      color: var(--transfer-in-color);
    }
  }

  .transfer--out {
    .server-info-item-value {
      color: #ddd;
    }
    .text-value {
      color: var(--transfer-out-color);
    }
  }

  .server-info--order-link {
    padding: 10px 0 0;
  }
  .buy-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    padding: 0 10px;
    gap: 5px;
    line-height: 1;
    font-weight: bold;
    color: var(--list-item-buy-link-color);
    border: 2px solid var(--list-item-buy-link-color);
    border-radius: 8px;
    transition: all 150ms ease;
    cursor: pointer;

    &:hover {
      color: #111;
      border-color: var(--list-item-buy-link-color);
      background-color: var(--list-item-buy-link-color);
    }

    @media screen and (max-width: 768px) {
      cursor: default;
    }

    .icon {
      font-size: 18px;
      font-weight: normal;
    }
  }

  .server-info-tag-list {
    display: flex;
    gap: 6px;

    .server-info-tag-item {
      height: 18px;
      padding: 0 5px 0 6px;
      line-height: 20px;
      font-size: 12px;
      color: var(--public-note-tag-color);
      background-color: var(--public-note-tag-bg);
      border-radius: 4px;
    }
  }
}
</style>
