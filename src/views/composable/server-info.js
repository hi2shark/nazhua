import {
  computed,
} from 'vue';
import * as hostUtils from '@/utils/host';

export default (params) => {
  const {
    props,
  } = params || {};
  const cpuAndMemAndDisk = computed(() => {
    let cpuInfo;
    let memInfo;
    let distInfo;
    if (props.info?.Host?.CPU?.[0]) {
      cpuInfo = hostUtils.getCPUInfo(props.info.Host.CPU[0]);
    }
    if (props.info?.Host?.MemTotal) {
      memInfo = hostUtils.calcBinary(props.info.Host.MemTotal);
    }
    if (props.info?.Host?.DiskTotal) {
      distInfo = hostUtils.calcBinary(props.info.Host.DiskTotal);
    }
    const text = [];
    if (cpuInfo) {
      text.push(`${cpuInfo.cores}C`);
    }
    if (memInfo) {
      if (memInfo.m > 900) {
        text.push(`${Math.round(memInfo.g)}G`);
      } else {
        text.push(`${(memInfo.g).toFixed(1) * 1}G`);
      }
    }
    if (distInfo) {
      if (distInfo.g > 900) {
        text.push(`${Math.round(distInfo.t)}T`);
      } else {
        text.push(`${Math.ceil(distInfo.g)}G`);
      }
    }
    return text.join('');
  });

  return {
    cpuAndMemAndDisk,
  };
};
