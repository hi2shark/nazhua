import {
  computed,
} from 'vue';
import config from '@/config';
import i18n from '@/i18n';
import validate from '@/utils/validate';
import * as hostUtils from '@/utils/host';

function getColor(type, mode) {
  const colors = {
    cpu: {
      linear: ['#0088FF', '#72B7FF'],
      default: '#0088FF',
      simple: '#007B43',
    },
    mem: {
      linear: ['#2B6939', '#0AA344'],
      default: '#0AA344',
      simple: '#007B43',
    },
    swap: {
      linear: ['#FF8C00', '#F38100'],
      default: '#FF8C00',
      simple: '#007B43',
    },
    disk: {
      linear: ['#00848F', '#70F3FF'],
      default: '#70F3FF',
      simple: '#007B43',
    },
  };
  return colors[type][mode];
}

export default (params) => {
  const {
    props,
    statusListTpl = 'cpu,mem,disk',
  } = params || {};
  if (!props?.info) {
    return {};
  }

  const lightBackground = computed(() => config.nazhua.lightBackground);
  const serverStatusColorMode = computed(() => {
    if (config.nazhua.simpleColorMode) {
      return 'simple';
    }
    if (config.nazhua.serverStatusLinear || lightBackground.value) {
      return 'linear';
    }
    return 'default';
  });

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
    const totalColor = lightBackground.value ? 'rgba(125, 125, 125, 0.5)' : 'rgba(255, 255, 255, 0.25)';
    switch (i) {
      case 'cpu':
      {
        const CoresVal = cpuInfo.value?.cores ? `${cpuInfo.value?.cores}C` : '-';
        const usedColor = getColor('cpu', serverStatusColorMode.value);
        const valPercent = `${(props.info.State?.CPU || 0).toFixed(1) * 1}%`;
        const valText = valPercent;
        return {
          type: 'cpu',
          used: (props.info.State?.CPU || 0).toFixed(1) * 1,
          colors: {
            used: usedColor,
            total: totalColor,
          },
          valText,
          valPercent,
          label: i18n.global.t('cpu'),
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
        const usedColor = getColor('mem', serverStatusColorMode.value);
        return {
          type: 'mem',
          used: useMemAndTotalMem.value.usePercent,
          colors: {
            used: usedColor,
            total: totalColor,
          },
          valText,
          valPercent: `${useMemAndTotalMem.value.usePercent.toFixed(1) * 1}%`,
          label: i18n.global.t('mem'),
          content: {
            default: i18n.global.t('rams', {
              ramComputed: contentVal,
            }),
            mobile: i18n.global.t('mems', {
              memComputed: contentVal,
            }),
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
        const usedColor = getColor('swap', serverStatusColorMode.value);
        return {
          type: 'swap',
          used: useSwapAndTotalSwap.value.usePercent,
          colors: {
            used: usedColor,
            total: totalColor,
          },
          valText,
          valPercent: `${useSwapAndTotalSwap.value.usePercent.toFixed(1) * 1}%`,
          label: i18n.global.t('swap'),
          content: {
            default: i18n.global.t('swapMem', {
              swapComputed: contentVal,
            }),
            mobile: i18n.global.t('swaps', {
              swapComputed: contentVal,
            }),
          },
        };
      }
      case 'disk':
      {
        let valText;
        if (useDiskAndTotalDisk.value.used.t >= 1 && useDiskAndTotalDisk.value.total.t >= 1) {
          valText = `${(useDiskAndTotalDisk.value.used.t).toFixed(1) * 1}T`;
        } else {
          valText = `${Math.ceil(useDiskAndTotalDisk.value.used.g)}G`;
        }
        let contentValue;
        if (useDiskAndTotalDisk.value.total.t >= 1) {
          contentValue = `${(useDiskAndTotalDisk.value.total.t).toFixed(1) * 1}T`;
        } else {
          contentValue = `${Math.ceil(useDiskAndTotalDisk.value.total.g)}G`;
        }
        const usedColor = getColor('disk', serverStatusColorMode.value);
        return {
          type: 'disk',
          used: useDiskAndTotalDisk.value.usePercent,
          colors: {
            used: usedColor,
            total: totalColor,
          },
          valText,
          valPercent: `${useDiskAndTotalDisk.value.usePercent.toFixed(1) * 1}%`,
          label: i18n.global.t('disk'),
          content: {
            default: i18n.global.t('diskCapacity', {
              diskComputed: contentValue,
            }),
            mobile: i18n.global.t('disks', {
              diskComputed: contentValue,
            }),
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
