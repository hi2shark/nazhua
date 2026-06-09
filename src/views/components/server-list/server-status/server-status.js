/**
 * ServerStatus风格的列表列配置
 */
import {
  h,
} from 'vue';

// import * as hostUtils from '@/utils/host';
import {
  getCycleTransferSummaryByServer,
} from '@/utils/cycle-transfer';
import handleServerStatus from '@/views/composable/server-status';
import handleServerInfo from '@/views/composable/server-info';
import handleServerRealTime from '@/views/composable/server-real-time';
import handleServerBillAndPlan from '@/views/composable/server-bill-and-plan';

import ServerStatusProgress from '@/views/components/server/server-status-progress.vue';
import CycleTransfer from '@/views/components/server-list/server-status/server-info/cycle-transfer.vue';
import StatusIcon from '@/views/components/server-list/server-status/server-info/status-icon.vue';
import SystemOS from '@/views/components/server-list/server-status/server-info/system-os.vue';
import Country from '@/views/components/server-list/server-status/server-info/country.vue';
import NetSpeed from '@/views/components/server-list/server-status/server-info/net-speed.vue';
import Transfer from '@/views/components/server-list/server-status/server-info/transfer.vue';
import Conns from '@/views/components/server-list/server-status/server-info/conns.vue';

const COLUMN_MAP = Object.freeze({
  status: {
    label: '状态',
    width: 40,
  },
  name: {
    label: '名称',
    minWidth: 100,
    align: 'left',
  },
  config: {
    label: '规格',
    width: 80,
    align: 'left',
  },
  system: {
    label: '系统',
    width: 90,
    align: 'left',
  },
  country: {
    label: '地区',
    width: 60,
    align: 'left',
  },
  duration: {
    label: '在线',
    width: 60,
    align: 'left',
  },
  load: {
    label: '负载',
    width: 45,
    align: 'center',
  },
  speeds: {
    label: '网速',
    width: 122,
    align: 'center',
  },
  inSpeed: {
    label: '入网',
    width: 60,
    align: 'left',
  },
  outSpeed: {
    label: '出网',
    width: 60,
    align: 'left',
  },
  transfer: {
    label: '流量',
    width: 122,
    align: 'center',
  },
  inTransfer: {
    label: '入网流量',
    width: 60,
    align: 'left',
  },
  outTransfer: {
    label: '出网流量',
    width: 60,
    align: 'left',
  },
  conns: {
    label: '连接',
    width: 72,
    align: 'center',
  },
  tcp: {
    label: 'TCP',
    width: 40,
    align: 'left',
  },
  udp: {
    label: 'UDP',
    width: 40,
    align: 'left',
  },
  cpu: {
    label: 'CPU',
    width: 80,
    align: 'center',
  },
  cpuText: {
    valProp: 'cpu',
    label: 'CPU',
    width: 40,
    align: 'center',
  },
  mem: {
    label: '内存',
    width: 80,
    align: 'center',
  },
  memText: {
    valProp: 'mem',
    label: '内存',
    width: 40,
    align: 'center',
  },
  swap: {
    label: '交换',
    width: 80,
    align: 'center',
  },
  swapText: {
    valProp: 'swap',
    label: '交换',
    width: 40,
    align: 'center',
  },
  disk: {
    label: '硬盘',
    width: 80,
    align: 'center',
  },
  diskText: {
    valProp: 'disk',
    label: '硬盘',
    width: 40,
    align: 'center',
  },
  billing: {
    label: '价格',
    width: 100,
    align: 'right',
  },
  remainingTime: {
    label: '剩余',
    width: 70,
    align: 'right',
  },
  cycleTransfer: {
    label: '周期流量',
    minWidth: 96,
    align: 'center',
  },
});

/**
 * 默认列配置
 */
// eslint-disable-next-line max-len, vue/max-len
const DEFAULT_COLUMNS = 'status,name,country,system,config,duration,speeds,transfer,cycleTransfer,load,cpu,mem,disk,billing,remainingTime';

/**
 * 需要实时更新的数据
 */
const RELD_TIME_DATA = [
  'speeds', 'inSpeed', 'outSpeed',
  'transfer', 'inTransfer', 'outTransfer',
  'conns', 'tcp', 'udp',
  'duration', 'load',
];

/**
 * 获取列配置
 * @param {string} columnsTpls 列配置模板
 * @returns {Object} 列配置
 * @property {Array} columns 列配置
 */
export const getColumnPropsConfig = (tpls = DEFAULT_COLUMNS) => {
  const tplList = tpls.split(',');
  const columnList = [];
  tplList.forEach((tpl) => {
    if (COLUMN_MAP[tpl]) {
      columnList.push({
        prop: tpl,
        ...COLUMN_MAP[tpl],
      });
    }
  });
  return columnList;
};

/**
 * 将服务器数据转换为表格数据
 * @param {Object} server 服务器数据
 * @returns {Object} 表格数据
 */
export const handleServerItemData = (params) => {
  const {
    column,
    server,
    realTimeData,
    progressData,
    billAndPlan,
    cycleTransferSummary,
  } = params || {};
  switch (column.prop) {
    case 'status':
      return {
        type: 'component',
        component: h(StatusIcon, { info: server }),
        originalData: params,
      };
    case 'name':
      return {
        type: 'text',
        value: server.Name,
        originalData: params,
      };
    case 'config':
    {
      const { cpuAndMemAndDisk } = handleServerInfo({
        props: {
          info: server,
        },
        originalData: params,
      });
      return {
        type: 'text',
        value: cpuAndMemAndDisk,
        originalData: params,
      };
    }
    case 'system':
      return {
        type: 'component',
        component: h(SystemOS, { info: server }),
        originalData: params,
      };
    case 'country':
      return {
        type: 'component',
        component: h(Country, { info: server }),
        originalData: params,
      };
    case 'speeds':
      return {
        type: 'component',
        component: h(NetSpeed, { realTimeData }),
        originalData: params,
      };
    case 'transfer':
      return {
        type: 'component',
        component: h(Transfer, { realTimeData }),
        originalData: params,
      };
    case 'conns':
      return {
        type: 'component',
        component: h(Conns, { realTimeData }),
        originalData: params,
      };
    case 'cpu':
    case 'mem':
    case 'disk':
    case 'swap':
    {
      const progressItem = progressData[column.prop];
      return {
        type: 'component',
        component: h(ServerStatusProgress, {
          type: column.prop,
          used: progressItem?.used || 0,
          colors: progressItem?.colors || {},
          valText: progressItem?.valPercent || '',
        }),
        originalData: params,
      };
    }
    case 'cpuText':
    case 'memText':
    case 'diskText':
    case 'swapText':
    {
      const progressItem = progressData[column.valProp];
      return {
        prop: column.prop,
        type: 'text',
        value: parseFloat(progressItem?.used || 0).toFixed(1),
        unit: '%',
        text: progressItem?.valPercent || '',
        originalData: params,
      };
    }
    case 'billing':
    {
      const item = billAndPlan?.value?.billing;
      const texts = [];
      if (item?.value) {
        texts.push(item.value || '-');
      }
      if (item?.cycleLabel) {
        texts.push(item.cycleLabel);
      }
      return {
        prop: column.prop,
        type: 'text',
        text: texts.length ? texts.join('/') : '-',
        originalData: params,
      };
    }
    case 'remainingTime':
    {
      const item = billAndPlan?.value?.remainingTime;
      return {
        prop: column.prop,
        type: 'text',
        text: item?.value || '-',
        originalData: params,
      };
    }
    case 'cycleTransfer':
      return {
        type: 'component',
        component: h(CycleTransfer, {
          summary: cycleTransferSummary,
        }),
        originalData: params,
      };
    default: {
      if (RELD_TIME_DATA.includes(column.prop) && realTimeData[column.prop]) {
        const item = realTimeData[column.prop];
        return {
          prop: column.prop,
          type: 'text',
          text: item?.text,
          value: item?.value,
          unit: item?.unit,
          originalData: params,
        };
      }
      return {
        prop: column.prop,
        type: 'text',
        value: '-',
        originalData: params,
      };
    }
  }
};

/**
 * 将服务器数据转换为表格数据
 * @param {Object} server 服务器数据
 * @param {Array} columns 列配置
 * @returns {Array} 表格数据
 */
export const handleServerListColumn = (serverList, columnTpls = DEFAULT_COLUMNS, cycleTransferMap = {}) => {
  const columnProps = getColumnPropsConfig(columnTpls);
  const tpls = columnProps.map((column) => column.valProp || column.prop).join(',');
  const hasBilling = columnTpls.includes('billing');
  const hasRemainingTime = columnTpls.includes('remainingTime');
  const hasCycleTransfer = columnTpls.includes('cycleTransfer');
  let showBilling = false;
  let showRemainingTime = false;
  let showCycleTransfer = false;
  const list = serverList.map((server) => {
    // 负载\网速\流量\在线等
    const realTimeResult = handleServerRealTime({
      props: {
        info: server,
      },
      serverRealTimeListTpls: tpls,
    });
    const realTimeData = {};
    realTimeResult?.serverRealTimeList?.value?.forEach?.((item) => {
      if (item.show) {
        const text = [item.value];
        if (item.unit) {
          text.push(item.unit);
        }
        realTimeData[item.key] = {
          value: item.value,
          unit: item.unit,
          text: text.join(''),
          item,
        };
      } else {
        realTimeData[item.key] = {
          text: '-',
          item,
        };
      }
    });
    // CPU\内存\硬盘\交换 进度条
    const {
      serverStatusList,
    } = handleServerStatus({
      props: {
        info: server,
      },
      statusListTpl: tpls,
      statusListItemContent: false,
    });
    const progressData = {};
    serverStatusList.value?.forEach?.((item) => {
      progressData[item.type] = item;
    });
    let billAndPlan = null;
    if (hasBilling || hasRemainingTime) {
      const result = handleServerBillAndPlan({
        props: {
          info: server,
        },
      });
      billAndPlan = result.billAndPlan;
      if (billAndPlan?.value?.billing) {
        showBilling = true;
      }
      if (billAndPlan?.value?.remainingTime) {
        showRemainingTime = true;
      }
    }
    const cycleTransferSummary = getCycleTransferSummaryByServer(cycleTransferMap, server);
    if (hasCycleTransfer && cycleTransferSummary) {
      showCycleTransfer = true;
    }

    const columnData = [];
    columnProps.forEach((columnItem) => {
      columnData.push({
        ...columnItem,
        data: handleServerItemData({
          column: columnItem,
          server,
          realTimeData,
          progressData,
          billAndPlan,
          cycleTransferSummary,
        }),
      });
    });

    return {
      info: server,
      columnData,
      computedData: {
        realTimeData,
        progressData,
        billAndPlan,
      },
    };
  });
  return {
    list,
    columnProps,
    showBilling,
    showRemainingTime,
    showCycleTransfer,
  };
};
