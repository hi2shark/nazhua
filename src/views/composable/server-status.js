import {
  computed,
} from 'vue';
import validate from '@/utils/validate';
import * as hostUtils from '@/utils/host';

export default (params) => {
  const {
    props,
    statusListTpl = 'cpu,mem,disk',
  } = params || {};
  if (!props?.info) {
    return {};
  }
  const cpuInfo = computed(() => {
    if (props.info?.Host?.CPU) {
      return hostUtils.getCPUInfo(props.info.Host.CPU[0]);
    }
    return {};
  });

  const useMemAndTotalMem = computed(() => {
    const used = hostUtils.calcBinary(props.info?.State?.MemUsed || 0);
    const total = hostUtils.calcBinary(props.info?.Host?.MemTotal || 1);
    const usePercent = ((props.info?.State?.MemUsed / props.info?.Host?.MemTotal) * 100).toFixed(2) * 1 || 0;
    return {
      used,
      total,
      usePercent,
    };
  });

  const useSwapAndTotalSwap = computed(() => {
    if (!props.info?.Host?.SwapTotal || props.info?.Host?.SwapTotal === 0) {
      return null;
    }
    const used = hostUtils.calcBinary(props.info?.State?.SwapUsed || 0);
    const total = hostUtils.calcBinary(props.info?.Host?.SwapTotal || 1);
    const usePercent = ((props.info?.State?.SwapUsed / props.info?.Host?.SwapTotal) * 100).toFixed(2) * 1 || 0;
    return {
      used,
      total,
      usePercent,
    };
  });

  const useDiskAndTotalDisk = computed(() => {
    const used = hostUtils.calcBinary(props.info?.State?.DiskUsed || 0);
    const total = hostUtils.calcBinary(props.info?.Host?.DiskTotal || 1);
    const usePercent = ((props.info?.State?.DiskUsed / props.info?.Host?.DiskTotal) * 100).toFixed(2) * 1 || 0;
    return {
      used,
      total,
      usePercent,
    };
  });

  /**
   * 状态列表
   */
  const serverStatusList = computed(() => statusListTpl.split(',').map((i) => {
    switch (i) {
      case 'cpu':
        return {
          type: 'cpu',
          used: (props.info.State.CPU).toFixed(1) * 1,
          colors: {
            used: '#0088ff',
            total: 'rgba(255, 255, 255, 0.2)',
          },
          valText: `${(props.info.State.CPU).toFixed(1) * 1}%`,
          label: 'CPU',
          content: {
            default: cpuInfo.value?.core,
            mobile: `${cpuInfo.value?.cores}C`,
          },
        };
      case 'mem':
      {
        let contentVal;
        if (useMemAndTotalMem.value.total.g > 4) {
          contentVal = `${(useMemAndTotalMem.value.total.g).toFixed(1) * 1}G`;
        } else {
          contentVal = `${Math.ceil(useMemAndTotalMem.value.total.m)}M`;
        }
        return {
          type: 'mem',
          used: useMemAndTotalMem.value.usePercent,
          colors: {
            used: '#0aa344',
            total: 'rgba(255, 255, 255, 0.2)',
          },
          valText: `${Math.ceil(useMemAndTotalMem.value.used.m)}M`,
          label: '内存',
          content: {
            default: `运行内存${contentVal}`,
            mobile: `内存${contentVal}`,
          },
        };
      }
      case 'swap':
      {
        if (!useSwapAndTotalSwap.value) {
          return null;
        }
        let contentVal;
        if (useSwapAndTotalSwap.value.total.g > 4) {
          contentVal = `${(useSwapAndTotalSwap.value.total.g).toFixed(1) * 1}G`;
        } else {
          contentVal = `${Math.ceil(useSwapAndTotalSwap.value.total.m)}M`;
        }
        return {
          type: 'swap',
          used: useSwapAndTotalSwap.value.usePercent,
          colors: {
            used: '#ff8c00',
            total: 'rgba(255, 255, 255, 0.2)',
          },
          valText: `${Math.ceil(useSwapAndTotalSwap.value.used.m)}M`,
          label: '交换',
          content: {
            default: `交换内存${contentVal}`,
            mobile: `交换${contentVal}`,
          },
        };
      }
      case 'disk':
      {
        let contentValue;
        if (useDiskAndTotalDisk.value.total.t >= 2) {
          contentValue = `${(useDiskAndTotalDisk.value.total.t).toFixed(1) * 1}T`;
        } else {
          contentValue = `${Math.ceil(useDiskAndTotalDisk.value.total.g)}G`;
        }
        return {
          type: 'disk',
          used: useDiskAndTotalDisk.value.usePercent,
          colors: {
            used: '#70f3ff',
            total: 'rgba(255, 255, 255, 0.2)',
          },
          valText: `${(useDiskAndTotalDisk.value.used.g).toFixed(1) * 1}G`,
          label: '磁盘',
          content: {
            default: `磁盘容量${contentValue}`,
            mobile: `磁盘${contentValue}`,
          },
        };
      }
      default:
    }
    return null;
  }).filter((i) => validate.isSet(i)));

  return {
    cpuInfo,
    useMemAndTotalMem,
    useSwapAndTotalSwap,
    useDiskAndTotalDisk,
    serverStatusList,
  };
};
