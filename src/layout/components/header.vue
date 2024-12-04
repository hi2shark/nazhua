<template>
  <div
    class="layout-header"
    :style="headerStyle"
  >
    <div class="layer-header-container">
      <div class="left-box">
        <span
          class="site-name"
          @click="toHome"
        >{{ title }}</span>
      </div>
      <div class="right-box">
        <div
          v-if="serverCount?.total && showServerCount"
          class="server-count-group"
        >
          <span class="server-count server-count--total">
            <span class="text">共</span>
            <span class="value">{{ serverCount.total }}</span>
            <span class="text">台服务器</span>
          </span>
          <span
            v-if="serverCount.online !== serverCount.total"
            class="server-count server-count--online"
          >
            <span class="text">在线</span>
            <span class="value">{{ serverCount.online }}</span>
          </span>
          <span
            v-if="serverCount.offline"
            class="server-count server-count--offline"
          >
            <span class="text">离线</span>
            <span class="value">{{ serverCount.offline }}</span>
          </span>
        </div>
        <div
          v-if="serverStat && showServerStat"
          class="server-stat-group"
        >
          <div
            v-if="serverStat.transfer"
            class="server-stat server-stat--transfer"
          >
            <span class="server-stat-label">
              <span class="text">流量</span>
            </span>
            <div class="server-stat-content">
              <span class="server-stat-item server-stat-item--in">
                <span class="ri-download-line" />
                <span class="text-value">
                  {{ serverStat.transfer.inData.value }}
                </span>
                <span class="text-unit">
                  {{ serverStat.transfer.inData.unit }}
                </span>
              </span>
              <span class="server-stat-item server-stat-item--out">
                <span class="ri-upload-line" />
                <span class="text-value">
                  {{ serverStat.transfer.outData.value }}
                </span>
                <span class="text-unit">
                  {{ serverStat.transfer.outData.unit }}
                </span>
              </span>
            </div>
          </div>
          <div
            v-if="serverStat.netSpeed"
            class="server-stat server-stat--net-speed"
          >
            <span class="server-stat-label">
              <span class="text">网速</span>
            </span>
            <div class="server-stat-content">
              <span class="server-stat-item server-stat-item--in">
                <span class="ri-arrow-down-line" />
                <span class="text-value">
                  {{ serverStat.netSpeed.inData.value }}
                </span>
                <span class="text-unit">
                  {{ serverStat.netSpeed.inData.unit }}
                </span>
              </span>
              <span class="server-stat-item server-stat-item--out">
                <span class="ri-arrow-up-line" />
                <span class="text-value">
                  {{ serverStat.netSpeed.outData.value }}
                </span>
                <span class="text-unit">
                  {{ serverStat.netSpeed.outData.unit }}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * LayoutHeader
 */
import {
  ref,
  computed,
  onMounted,
} from 'vue';
import {
  useStore,
} from 'vuex';
import {
  useRoute,
  useRouter,
} from 'vue-router';
import * as hostUtils from '@/utils/host';

import config from '@/config';

const store = useStore();
const route = useRoute();
const router = useRouter();

const headerStyle = computed(() => {
  const style = {};
  if (route.name === 'ServerDetail') {
    style['--layout-header-container-width'] = 'var(--detail-container-width)';
  } else {
    style['--layout-header-container-width'] = 'var(--list-container-width)';
  }
  return style;
});

const showServerCount = config.nazhua.hideNavbarServerCount !== true;
const serverCount = computed(() => store.state.serverCount);

const showServerStat = config.nazhua.hideNavbarServerStat !== true;
const serverStat = computed(() => {
  const transfer = {
    in: 0,
    inData: {
      value: 0,
      unit: '',
    },
    out: 0,
    outData: {
      value: 0,
      unit: '',
    },
  };
  const netSpeed = {
    in: 0,
    inData: {
      value: 0,
      unit: '',
    },
    out: 0,
    outData: {
      value: 0,
      unit: '',
    },
  };
  if (store.state.serverList.length) {
    store.state.serverList.forEach((server) => {
      if (server.online === 1 && server.State) {
        transfer.in += server.State.NetInTransfer;
        transfer.out += server.State.NetOutTransfer;
        netSpeed.in += server.State.NetInSpeed;
        netSpeed.out += server.State.NetOutSpeed;
      }
    });
  }
  const calcInTransfer = hostUtils.calcBinary(transfer.in);
  if (calcInTransfer.t > 1) {
    transfer.inData.value = (calcInTransfer.g).toFixed(1) * 1;
    transfer.inData.unit = 'T';
  } else if (calcInTransfer.g > 1) {
    transfer.inData.value = (calcInTransfer.g).toFixed(1) * 1;
    transfer.inData.unit = 'G';
  } else if (calcInTransfer.m > 1) {
    transfer.inData.value = (calcInTransfer.m).toFixed(1) * 1;
    transfer.inData.unit = 'M';
  } else {
    transfer.inData.value = calcInTransfer.value;
    transfer.inData.unit = 'K';
  }
  const calcOutTransfer = hostUtils.calcBinary(transfer.out);
  if (calcOutTransfer.t > 1) {
    transfer.outData.value = (calcOutTransfer.g).toFixed(1) * 1;
    transfer.outData.unit = 'T';
  } else if (calcOutTransfer.g > 1) {
    transfer.outData.value = (calcOutTransfer.g).toFixed(1) * 1;
    transfer.outData.unit = 'G';
  } else if (calcOutTransfer.m > 1) {
    transfer.outData.value = (calcOutTransfer.m).toFixed(1) * 1;
    transfer.outData.unit = 'M';
  } else {
    transfer.outData.value = calcOutTransfer.value;
    transfer.outData.unit = 'K';
  }
  const calcNetInSpeed = hostUtils.calcBinary(netSpeed.in);
  if (calcNetInSpeed.g > 1) {
    netSpeed.inData.value = (calcNetInSpeed.g).toFixed(1) * 1;
    netSpeed.inData.unit = 'G';
  } else if (calcNetInSpeed.m > 1) {
    netSpeed.inData.value = (calcNetInSpeed.m).toFixed(1) * 1;
    netSpeed.inData.unit = 'M';
  } else {
    netSpeed.inData.value = (calcNetInSpeed.k).toFixed(1) * 1;
    netSpeed.inData.unit = 'K';
  }
  const calcNetOutSpeed = hostUtils.calcBinary(netSpeed.out);
  if (calcNetOutSpeed.g > 1) {
    netSpeed.outData.value = (calcNetOutSpeed.g).toFixed(1) * 1;
    netSpeed.outData.unit = 'G';
  } else if (calcNetOutSpeed.m > 1) {
    netSpeed.outData.value = (calcNetOutSpeed.m).toFixed(1) * 1;
    netSpeed.outData.unit = 'M';
  } else {
    netSpeed.outData.value = (calcNetOutSpeed.k).toFixed(1) * 1;
    netSpeed.outData.unit = 'K';
  }
  return {
    transfer,
    netSpeed,
  };
});

const title = ref(config.nazhua.title);

function toHome() {
  if (route.name !== 'Home') {
    router.push({
      name: 'Home',
    });
  }
}

onMounted(() => {
  title.value = config.nazhua.title;
});
</script>

<style lang="scss" scoped>
.layout-header {
  position: sticky;
  top: 0;
  z-index: 100;
  min-height: var(--layout-header-height);
  background-position: 0% 0%;
  background-image: radial-gradient(transparent 1px, rgba(#000, 0.8) 2px);
  background-size: 3px 3px;
  backdrop-filter: saturate(50%) blur(3px);
  box-shadow: 0 2px 4px rgba(#000, 0.2);

  .site-name {
    line-height: calc(var(--layout-header-height) - 20px);
    font-size: 24px;
    color: #fff;
    text-shadow: 2px 2px 4px rgba(#000, 0.5);
    cursor: pointer;
  }

  .server-count-group {
    display: flex;
    gap: 10px;
    line-height: 30px;
  }

  .server-count {
    display: flex;
    align-items: center;
    gap: 3px;
    color: #ddd;

    &.server-count--total {
      .value {
        color: #70f3ff;
      }
    }
    &.server-count--online {
      .value {
        color: #0f0;
      }
    }
    &.server-count--offline {
      .value {
        color: #f00;
      }
    }
  }

  .layer-header-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0 20px;
    width: var(--layout-header-container-width, 100%);
    margin: auto;
    padding: 10px 20px;
    transition: width 0.3s;
  }

  .right-box {
    display: flex;
    align-items: center;
    gap: 20px;
    color: #ddd;
  }

  .server-stat-group {
    min-width: 160px;
  }

  .server-stat {
    display: flex;
    gap: 8px;
    line-height: 16px;
    font-size: 12px;

    .server-stat-content {
      flex: 1;
      display: flex;
    }

    .server-stat-item {
      flex: 1;
    }

    .server-stat-item--in {
      .text-value {
        color: #ffc93c;
      }
    }

    .server-stat-item--out {
      .text-value {
        color: #90f2ff;
      }
    }
  }
}
</style>
