<template>
  <dot-dot-box class="server-info-box">
    <div class="server-info-group server-info--cpu">
      <div class="server-info-label">
        {{ $t('cpu') }}
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
        {{ $t('gpu') }}
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
    <div
      v-if="temperatureData.list.length"
      class="server-info-group server-info--temperature"
    >
      <div class="server-info-label">
        {{ $t('temperature') }}
      </div>
      <div class="server-info-content">
        <div class="server-info-item-group">
          <template
            v-for="(ttItem, ttIndex) in temperatureData.list"
            :key="`${info.ID}_temperature_${ttIndex}`"
          >
            <popover :title="ttItem?.title || (`${ttItem.label}: ${ttItem.value}`)">
              <template #trigger>
                <span
                  class="server-info-item"
                  :class="`temperature--${ttItem.type}`"
                >
                  <span class="server-info-item-icon">
                    <i
                      v-if="ttItem.type === 'cpu' || ttItem.label.toLowerCase().includes('cpu')"
                      class="ri-cpu-line"
                    />
                    <i
                      v-else-if="ttItem.type === 'gpu' || ttItem.label.toLowerCase().includes('gpu')"
                      class="ri-gamepad-line"
                    />
                    <i
                      v-else-if="ttItem.type === 'nvme' || ttItem.label.toLowerCase().includes('nvme')"
                      class="ri-hard-drive-3-line"
                    />
                    <i
                      v-else-if="ttItem.type === 'motherboard'"
                      class="ri-instance-line"
                    />
                    <i
                      v-else
                      class="ri-temp-hot-line"
                    />
                  </span>
                  <span class="server-info-item-value">
                    {{ ttItem.value }}
                  </span>
                </span>
              </template>
            </popover>
          </template>
        </div>
      </div>
    </div>
    <div class="server-info-group server-info--system-os">
      <div class="server-info-label">
        {{ $t('systemOS') }}
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
        {{ $t('occupancy') }}
      </div>
      <div class="server-info-content">
        <div class="server-info-item-group">
          <span class="server-info-item process-count">
            <span class="server-info-item-label">{{ $t('processCount') }}</span>
            <span class="server-info-item-value">{{ processCount }}</span>
          </span>
          <span class="server-info-item load">
            <span class="server-info-item-label">{{ $t('load') }}</span>
            <span class="server-info-item-value">
              {{ sysLoadInfo }}
            </span>
          </span>
        </div>
      </div>
    </div>
    <div class="server-info-group server-info--transfer">
      <div class="server-info-label">
        {{ $t('traffic') }}
      </div>
      <div class="server-info-content">
        <div class="server-info-item-group">
          <span class="server-info-item transfer--in">
            <span class="server-info-item-label">{{ $t('inTransfer') }}</span>
            <span class="server-info-item-value">
              <span class="text-value">{{ transfer?.in?.value }}</span>
              <span class="text-unit">{{ transfer?.in?.unit }}</span>
            </span>
          </span>
          <span class="server-info-item transfer--out">
            <span class="server-info-item-label">{{ $t('outTransfer') }}</span>
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
        {{ $t('conn') }}
      </div>
      <div class="server-info-content">
        <div class="server-info-item-group">
          <span class="server-info-item conn--tcp">
            <span class="server-info-item-label">{{ $t('tcp') }}</span>
            <span class="server-info-item-value">{{ tcpConnCount }}</span>
          </span>
          <span class="server-info-item conn--tcp">
            <span class="server-info-item-label">{{ $t('udp') }}</span>
            <span class="server-info-item-value">{{ udpConnCount }}</span>
          </span>
        </div>
      </div>
    </div>
    <div class="server-info-group server-info--boottime">
      <div class="server-info-label">
        {{ $t('boot') }}
      </div>
      <div class="server-info-content">
        <span class="server-info-item runtime--boottime">
          <span class="server-info-item-value">{{ bootTime }}</span>
        </span>
      </div>
    </div>
    <div class="server-info-group server-info--lasttime">
      <div class="server-info-label">
        {{ $t('active') }}
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
        {{ $t('billPlan') }}
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
        {{ $t('tag') }}
      </div>
      <div class="server-info-content">
        <div class="server-info-tag-list">
          <span
            v-for="(tag, index) in tagList"
            :key="`${tag}_${index}`"
            class="server-info-tag-item"
            :class="{
              'has-sarasa-term': $hasSarasaTerm && config.nazhua.disableSarasaTermSC !== true,
            }"
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
            <span :class="buyBtnIcon" />
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
import {
  useI18n,
} from 'vue-i18n';
import dayjs from 'dayjs';

import config from '@/config';
import * as hostUtils from '@/utils/host';

import handleServerBillAndPlan from '@/views/composable/server-bill-and-plan';

const i18n = useI18n();
const props = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
});

const buyBtnIcon = computed(() => {
  if (props.info?.PublicNote?.customData?.buyBtnIcon) {
    return props.info?.PublicNote?.customData?.buyBtnIcon;
  }
  return config.nazhua.buyBtnIcon || 'ri-shopping-bag-3-line';
});
const buyBtnText = computed(() => {
  if (props.info?.PublicNote?.customData?.buyBtnText) {
    return props.info?.PublicNote?.customData?.buyBtnText;
  }
  return config.nazhua.buyBtnText || '购买';
});
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
  if (props.info?.State?.Load1 !== undefined) {
    return [
      props.info.State?.Load1,
      props.info.State?.Load5,
      props.info.State?.Load15,
    ].filter((i) => i !== undefined).map((i) => (i).toFixed(2) * 1).join(',');
  }
  return '-';
});

const temperatureData = computed(() => {
  const data = [];
  if (props.info?.State?.Temperatures) {
    const acpitz = [];
    const coretemp_package_id = [];
    const coretemp_core = [];
    const nvme = [];
    const k10temp = [];
    const amdgpu = [];
    const other = [];

    // 温度数据分类处理
    props.info.State.Temperatures.forEach((item) => {
      const name = item.Name.toLowerCase();
      const temp = item.Temperature;

      if (name.startsWith('acpitz')) {
        acpitz.push(temp);
        return;
      }
      if (name.startsWith('coretemp_package_id_')) {
        const coreIndex = parseInt(name.replace('coretemp_package_id_', ''), 10);
        coretemp_package_id.push({
          index: coreIndex,
          value: temp,
        });
        return;
      }
      if (name.startsWith('coretemp_core_')) {
        const coreIndex = parseInt(name.replace('coretemp_core_', ''), 10);
        coretemp_core.push({
          index: coreIndex,
          value: temp,
        });
        return;
      }
      if (name.includes('nvme')) {
        nvme.push({
          name: item.Name,
          value: temp,
        });
        return;
      }
      if (name.includes('k10temp')) {
        k10temp.push({
          name: item.Name,
          value: temp,
        });
        return;
      }
      if (name.includes('amdgpu')) {
        amdgpu.push({
          name: item.Name,
          value: temp,
        });
        return;
      }
      if (name.includes('motherboard') || name.includes('mainboard') || name.includes('board')) {
        other.push({
          label: '主板',
          value: temp,
          type: 'motherboard',
        });
        return;
      }
      other.push({
        label: item.Name,
        value: temp,
        type: 'other',
      });
    });

    // 主板温度处理
    if (acpitz.length) {
      const acpitzMean = (acpitz.reduce((a, b) => a + b, 0) / acpitz.length).toFixed(1);
      data.push({
        label: i18n.t('acpitz'),
        value: `${acpitzMean}℃`,
        title: acpitz.map((i, index) => `传感器${index + 1}: ${parseFloat(i).toFixed(1)}℃`).join('\n'),
        type: 'acpitz',
      });
    }

    // CPU温度处理
    if (coretemp_package_id.length || coretemp_core.length) {
      const temps = [];
      const details = [];

      // 处理 CPU 温度
      if (coretemp_package_id.length) {
        const cpuTemps = coretemp_package_id.map((i) => `${parseFloat(i.value).toFixed(1)}℃`);
        temps.push(cpuTemps.join(', '));
        details.push(...coretemp_package_id.map((i) => `CPU.${i.index + 1}: ${parseFloat(i.value).toFixed(1)}℃`));
      }

      // 处理核心温度
      if (coretemp_core.length) {
        const coreMean = (coretemp_core.reduce((a, b) => a + b.value, 0) / coretemp_core.length).toFixed(1);
        temps.push(`${parseFloat(coreMean).toFixed(1)}℃`);
        details.push(...coretemp_core.map((i) => `核心${i.index + 1}: ${parseFloat(i.value).toFixed(1)}℃`));
      }

      data.push({
        label: 'CPU',
        value: temps.join(' / '),
        title: details.join('\n'),
        type: 'cpu',
      });
    }

    // AMD CPU温度处理
    if (k10temp.length) {
      const tctl = k10temp.find((i) => i.name.includes('tctl'));
      if (tctl) {
        data.push({
          label: 'AMD CPU',
          value: `${parseFloat(tctl.value).toFixed(1)}℃`,
          title: k10temp.map((i) => `${i.name}: ${parseFloat(i.value).toFixed(1)}℃`).join('\n'),
          type: 'cpu',
        });
      }
    }

    // AMD GPU温度处理
    if (amdgpu.length) {
      const edge = amdgpu.find((i) => i.name.includes('edge'));
      if (edge) {
        data.push({
          label: 'AMD GPU',
          value: `${parseFloat(edge.value).toFixed(1)}℃`,
          title: amdgpu.map((i) => `${i.name}: ${parseFloat(i.value).toFixed(1)}℃`).join('\n'),
          type: 'gpu',
        });
      }
    }

    // NVME温度处理
    if (nvme.length) {
      const composite = nvme.find((i) => i.name.includes('composite'));
      if (composite) {
        data.push({
          label: 'NVME',
          value: `${parseFloat(composite.value).toFixed(1)}℃`,
          title: nvme.map((i) => `${i.name}: ${parseFloat(i.value).toFixed(1)}℃`).join('\n'),
          type: 'nvme',
        });
      }
    }

    // 其他温度处理
    other.forEach((i) => {
      data.push({
        label: i.label,
        value: `${parseFloat(i.value).toFixed(1)}℃`,
        type: i.type || 'other',
      });
    });
  }
  return {
    list: data,
  };
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
  const {
    networkRoute,
    extra,
    IPv4,
    IPv6,
  } = props?.info?.PublicNote?.planDataMod || {};
  if (networkRoute) {
    list.push(...networkRoute?.split?.(','));
  }
  if (extra) {
    list.push(...extra?.split?.(','));
  }
  if (IPv4 === '1' && IPv6 === '1') {
    list.push(i18n.t('ipv4ipv6'));
  } else if (IPv4 === '1') {
    list.push(i18n.t('ipv4'));
  } else if (IPv6 === '1') {
    list.push(i18n.t('ipv6'));
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
      text-transform: uppercase;
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

    &.temperature--other {
      // 移动端不显示
      @media screen and (max-width: 768px) {
        display: none;
      }
    }
  }

  .server-info-item {
    display: flex;
    gap: 0.2em;
    align-items: center;

    .server-info-item-icon {
      width: 24px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: #ccc;
    }
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

  .server-info--temperature {
    .server-info-item {
      .server-info-item-label {
        max-width: 4.5em;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
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
      line-height: 18px;
      font-size: 12px;
      color: var(--public-note-tag-color);
      background: var(--public-note-tag-bg);
      text-shadow: 1px 1px 2px rgba(#000, 0.2);
      border-radius: 4px;

      &.has-sarasa-term {
        line-height: 20px;
      }
    }
  }
}
</style>

<style lang="scss">
body.locale-en {
  .server-info-label {
    text-align: left !important;
  }
}
</style>
