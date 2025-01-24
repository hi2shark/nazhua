<template>
  <div
    v-if="serverStat"
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
</template>

<script setup>
/**
 * 服务器统计
 */
import {
  computed,
} from 'vue';
import {
  useStore,
} from 'vuex';
import * as hostUtils from '@/utils/host';

const store = useStore();

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
        if (typeof server.State.NetInTransfer === 'number') {
          transfer.in += server.State.NetInTransfer;
        }
        if (typeof server.State.NetOutTransfer === 'number') {
          transfer.out += server.State.NetOutTransfer;
        }
        if (typeof server.State.NetInSpeed === 'number') {
          netSpeed.in += server.State.NetInSpeed;
        }
        if (typeof server.State.NetOutSpeed === 'number') {
          netSpeed.out += server.State.NetOutSpeed;
        }
      }
    });
  }
  const calcInTransfer = hostUtils.calcBinary(transfer.in);
  if (calcInTransfer.t > 1) {
    transfer.inData.value = (calcInTransfer.t).toFixed(1) * 1;
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
    transfer.outData.value = (calcOutTransfer.t).toFixed(1) * 1;
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
  if (calcNetInSpeed.t > 1) {
    netSpeed.inData.value = (calcNetInSpeed.t).toFixed(1) * 1;
    netSpeed.inData.unit = 'T';
  } else if (calcNetInSpeed.g > 1) {
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
  if (calcNetOutSpeed.t > 1) {
    netSpeed.outData.value = (calcNetOutSpeed.t).toFixed(1) * 1;
    netSpeed.outData.unit = 'T';
  } else if (calcNetOutSpeed.g > 1) {
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
</script>

<style lang="scss" scoped>
.server-stat-group {
  min-width: 160px;

  @media screen and (max-width: 450px) {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 28px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    flex-direction: row-reverse;
    gap: 10px;

    .server-stat-label {
      display: none;
    }

    .server-stat-content {
      gap: 10px;
    }
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
  }

  .server-stat--transfer {
    .server-stat-item--in {
      .text-value {
        color: var(--transfer-in-color);
      }
    }

    .server-stat-item--out {
      .text-value {
        color: var(--transfer-out-color);
      }
    }
  }

  .server-stat--net-speed {
    .server-stat-item--in {
      .text-value {
        color: var(--net-speed-in-color);
      }
    }

    .server-stat-item--out {
      .text-value {
        color: var(--net-speed-out-color);
      }
    }
  }
}
</style>
