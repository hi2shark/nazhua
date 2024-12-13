import {
  computed,
} from 'vue';
import config from '@/config';
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
    if (props.info?.Host?.CPU?.[0]) {
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
      {
        const CoresVal = cpuInfo.value?.cores ? `${cpuInfo.value?.cores}C` : '-';
        const usedColor = config.nazhua.serverStatusLinear ? ['#0088FF', '#72B7FF'] : '#0088FF';
        const valPercent = `${(props.info.State?.CPU || 0).toFixed(1) * 1}%`;
        const valText = valPercent;
        return {
          type: 'cpu',
          used: (props.info.State?.CPU || 0).toFixed(1) * 1,
          colors: {
            used: usedColor,
            total: 'rgba(255, 255, 255, 0.25)',
          },
          valText,
          valPercent,
          label: 'CPU',
          content: {
            default: cpuInfo.value?.core || CoresVal,
            mobile: CoresVal,
          },
        };
      }
      case 'mem':
      {
        let valText;
        if (useMemAndTotalMem.value.used.g >= 10 && useMemAndTotalMem.value.total.g >= 10) {
          valText = `${(useMemAndTotalMem.value.used.g).toFixed(1) * 1}G`;
        } else {
          valText = `${Math.ceil(useMemAndTotalMem.value.used.m)}M`;
        }
        let contentVal;
        if (useMemAndTotalMem.value.total.g > 4) {
          contentVal = `${(useMemAndTotalMem.value.total.g).toFixed(1) * 1}G`;
        } else {
          contentVal = `${Math.ceil(useMemAndTotalMem.value.total.m)}M`;
        }
        const usedColor = config.nazhua.serverStatusLinear ? ['#2B6939', '#0AA344'] : '#0AA344';
        return {
          type: 'mem',
          used: useMemAndTotalMem.value.usePercent,
          colors: {
            used: usedColor,
            total: 'rgba(255, 255, 255, 0.25)',
          },
          valText,
          valPercent: `${useMemAndTotalMem.value.usePercent.toFixed(1) * 1}%`,
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
        let valText;
        if (useSwapAndTotalSwap.value.used.g >= 10 && useSwapAndTotalSwap.value.total.g >= 10) {
          valText = `${(useSwapAndTotalSwap.value.used.g).toFixed(1) * 1}G`;
        } else {
          valText = `${Math.ceil(useSwapAndTotalSwap.value.used.m)}M`;
        }
        let contentVal;
        if (useSwapAndTotalSwap.value.total.g > 4) {
          contentVal = `${(useSwapAndTotalSwap.value.total.g).toFixed(1) * 1}G`;
        } else {
          contentVal = `${Math.ceil(useSwapAndTotalSwap.value.total.m)}M`;
        }
        const usedColor = config.nazhua.serverStatusLinear ? ['#FF8C00', '#F38100'] : '#FF8C00';
        return {
          type: 'swap',
          used: useSwapAndTotalSwap.value.usePercent,
          colors: {
            used: usedColor,
            total: 'rgba(255, 255, 255, 0.25)',
          },
          valText,
          valPercent: `${useSwapAndTotalSwap.value.usePercent.toFixed(1) * 1}%`,
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
        if (useDiskAndTotalDisk.value.total.t >= 1) {
          contentValue = `${(useDiskAndTotalDisk.value.total.t).toFixed(1) * 1}T`;
        } else {
          contentValue = `${Math.ceil(useDiskAndTotalDisk.value.total.g)}G`;
        }
        const usedColor = config.nazhua.serverStatusLinear ? ['#00848F', '#70F3FF'] : '#70F3FF';
        return {
          type: 'disk',
          used: useDiskAndTotalDisk.value.usePercent,
          colors: {
            used: usedColor,
            total: 'rgba(255, 255, 255, 0.25)',
          },
          valText: `${(useDiskAndTotalDisk.value.used.g).toFixed(1) * 1}G`,
          valPercent: `${useDiskAndTotalDisk.value.usePercent.toFixed(1) * 1}%`,
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
