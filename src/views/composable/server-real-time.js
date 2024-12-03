import {
  computed,
} from 'vue';
import dayjs from 'dayjs';
import validate from '@/utils/validate';
import * as dateUtils from '@/utils/date';
import * as hostUtils from '@/utils/host';

export default (params) => {
  const {
    props,
    currentTime,
    serverRealTimeListTpls = 'duration,transfer,inSpeed,outSpeed',
  } = params || {};
  if (!props?.info) {
    return {};
  }
  /**
   * 计算在线时长
   */
  const duration = computed(() => {
    if (props.info?.Host?.BootTime) {
      const lastActive = dayjs(props.info.LastActive)?.valueOf?.();
      const data = dateUtils.duration2(props.info.Host.BootTime * 1000, lastActive || currentTime.value);
      if (data.days > 0) {
        return {
          value: data.days,
          symbol: data.$symbol.day,
        };
      }
      if (data.hours > 0) {
        return {
          value: data.hours,
          symbol: data.$symbol.hour,
        };
      }
      if (data.minutes > 0) {
        return {
          value: data.minutes,
          symbol: data.$symbol.minute,
        };
      }
      return {
        value: data.seconds,
        symbol: data.$symbol.second,
      };
    }
    return null;
  });

  /**
   * 计算流量
   */
  const transfer = computed(() => {
    const stats = {
      in: null,
      out: null,
      total: null,
    };
    let total = 0;
    if (props.info?.State?.NetInTransfer) {
      total += props.info.State.NetInTransfer;
      stats.in = hostUtils.calcBinary(props.info.State.NetInTransfer);
    }
    if (props.info?.State?.NetOutTransfer) {
      total += props.info.State.NetOutTransfer;
      stats.out = hostUtils.calcBinary(props.info.State.NetOutTransfer);
    }
    stats.total = hostUtils.calcBinary(total);

    const result = {
      value: 0,
      symbol: '',
      statType: '',
      statTypeLabel: '',
      stats,
    };

    let ruleStat;
    ruleStat = total;
    result.statType = 'Total';
    result.statTypeLabel = '双向';
    if (props.info?.PublicNote && validate.isSet(props.info.PublicNote?.planDataMod?.trafficType)) {
      const {
        trafficType = 2,
      } = props.info.PublicNote.planDataMod;
      switch (+trafficType) {
        case 1:
          ruleStat = props.info.State.NetOutTransfer;
          result.statType = 'Out';
          result.statTypeLabel = '单向出';
          break;
        case 3:
          if (props.info?.State?.NetOutTransfer >= props.info?.State?.NetInTransfer) {
            ruleStat = props.info.State.NetOutTransfer;
            result.statType = 'MaxOut';
            result.statTypeLabel = '最大出';
          } else if (props.info?.State?.NetOutTransfer < props.info?.State?.NetInTransfer) {
            ruleStat = props.info.State.NetInTransfer;
            result.statType = 'MaxIn';
            result.statTypeLabel = '最大入';
          }
          break;
        default:
      }
    }

    const ruleStats = hostUtils.calcBinary(ruleStat);
    if (ruleStats.t > 1) {
      result.value = (ruleStats.t).toFixed(2) * 1;
      result.symbol = 'T';
    } else if (ruleStats.g > 1) {
      result.value = (ruleStats.g).toFixed(2) * 1;
      result.symbol = 'G';
    } else if (ruleStats.m > 1) {
      result.value = (ruleStats.m).toFixed(1) * 1;
      result.symbol = 'M';
    } else {
      result.value = (ruleStats.k).toFixed(1) * 1;
      result.symbol = 'K';
    }
    return result;
  });

  /**
   * 计算入向网速
   */
  const netInSpeed = computed(() => {
    const inSpeed = hostUtils.calcBinary(props.info?.State?.NetInSpeed || 0);
    const result = {
      value: 0,
      symbol: '',
    };
    if (inSpeed.g > 1) {
      result.value = (inSpeed.g).toFixed(1) * 1;
      result.symbol = 'G';
    } else if (inSpeed.m > 1) {
      result.value = (inSpeed.m).toFixed(1) * 1;
      result.symbol = 'M';
    } else {
      result.value = (inSpeed.k).toFixed(1) * 1;
      result.symbol = 'K';
    }
    return result;
  });

  /**
   * 计算出向网速
   */
  const netOutSpeed = computed(() => {
    const outSpeed = hostUtils.calcBinary(props.info?.State?.NetOutSpeed || 0);
    const result = {
      value: 0,
      symbol: '',
    };
    if (outSpeed.g > 1) {
      result.value = (outSpeed.g).toFixed(1) * 1;
      result.symbol = 'G';
    } else if (outSpeed.m > 1) {
      result.value = (outSpeed.m).toFixed(1) * 1;
      result.symbol = 'M';
    } else {
      result.value = (outSpeed.k).toFixed(1) * 1;
      result.symbol = 'K';
    }
    return result;
  });

  const serverRealTimeList = computed(() => serverRealTimeListTpls.split(',').map((key) => {
    switch (key) {
      case 'duration':
        return {
          key,
          label: '在线',
          value: duration.value?.value,
          symbol: duration.value?.symbol,
        };
      case 'transfer':
        return {
          key,
          label: `${transfer.value.statTypeLabel}流量`,
          value: transfer.value?.value,
          symbol: transfer.value?.symbol,
        };
      case 'inSpeed':
        return {
          key,
          label: '入网',
          value: netInSpeed.value?.value,
          symbol: netInSpeed.value?.symbol,
        };
      case 'outSpeed':
        return {
          key,
          label: '出网',
          value: netOutSpeed.value?.value,
          symbol: netOutSpeed.value?.symbol,
        };
      default:
    }
    return null;
  }).filter((item) => item));

  return {
    duration,
    transfer,
    netInSpeed,
    netOutSpeed,
    serverRealTimeList,
  };
};
