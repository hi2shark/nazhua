import {
  computed,
} from 'vue';
import dayjs from 'dayjs';
import config from '@/config';
import validate from '@/utils/validate';
import * as dateUtils from '@/utils/date';

export default (params) => {
  const {
    props,
  } = params || {};
  /**
   * 账单和计划
   */
  const billAndPlan = computed(() => {
    const obj = {
      billing: null,
      remainingTime: null,
      bandwidth: null,
      traffic: null,
    };
    if (props?.info?.PublicNote) {
      const {
        billingDataMod,
        planDataMod,
      } = props.info.PublicNote;
      let months;
      // 套餐资费
      let cycleLabel;
      if (validate.isSet(billingDataMod?.cycle)) {
        switch (billingDataMod.cycle.toLowerCase()) {
          case '月':
          case 'm':
          case 'mo':
          case 'month':
          case 'monthly':
            cycleLabel = '月';
            months = 1;
            break;
          case '年':
          case 'y':
          case 'yr':
          case 'year':
          case 'annual':
            cycleLabel = '年';
            months = 12;
            break;
          case '季':
          case 'quarterly':
            cycleLabel = '季';
            months = 3;
            break;
          case '半':
          case '半年':
          case 'h':
          case 'half':
          case 'semi-annually':
            cycleLabel = '半年';
            months = 6;
            break;
          default:
            cycleLabel = billingDataMod.cycle;
            break;
        }
      }
      if (validate.isSet(billingDataMod?.amount)) {
        let isFree = false;
        let amountValue = billingDataMod.amount;
        let label;
        if (billingDataMod.amount.toString() === '-1') {
          amountValue = '按量';
          label = cycleLabel ? `每${cycleLabel}` : '';
        } else if (billingDataMod.amount.toString() === '0') {
          amountValue = config.nazhua.freeAmount || '免费';
          isFree = true;
        } else {
          label = cycleLabel ? `${cycleLabel}付` : '';
        }
        obj.billing = {
          label,
          value: amountValue,
          cycleLabel,
          months,
          isFree,
        };
      }
      // 剩余时间
      if (validate.isSet(billingDataMod?.endDate)) {
        const {
          endDate,
          autoRenewal,
        } = billingDataMod;
        const nowTime = new Date().getTime();
        const endTime = dayjs(endDate).valueOf();
        if (endDate.indexOf('0000-00-00') === 0) {
          obj.remainingTime = {
            label: '剩余',
            value: config.nazhua.infinityCycle || '长期有效',
            type: 'infinity',
          };
        } else if (autoRenewal === '1') {
          // 自动续费时间计算，cycleType 为 1 时为月，为 12 时为年
          // 判断endDate是否超过当前时间，超过则显示剩余时间
          if (endTime > nowTime) {
            const diff = dayjs(endTime).diff(dayjs(), 'day') + 1;
            obj.remainingTime = {
              label: '剩余',
              value: `${diff}天`,
              value2: diff,
              type: 'autoRenewal-endTime',
            };
          } else {
            // endDate如果早于当前时间，按照cycleType计算出超过当前时间的结束时间
            const nextTime = dateUtils.getNextCycleTime(endTime, months, nowTime);
            const diff = dayjs(nextTime).diff(dayjs(), 'day') + 1;
            obj.remainingTime = {
              label: '剩余',
              value: `${diff}天`,
              value2: diff,
              type: 'autoRenewal-nextTime',
            };
          }
        } else if (endTime > nowTime) {
          const diff = dayjs(endTime).diff(dayjs(), 'day') + 1;
          obj.remainingTime = {
            label: '剩余',
            value: `${diff}天`,
            value2: diff,
            type: 'endTime',
          };
        } else {
          obj.remainingTime = {
            label: '剩余',
            value: '已过期',
            type: 'expired',
          };
        }
      }
      // 带宽、流量
      if (planDataMod) {
        if (planDataMod.bandwidth) {
          obj.bandwidth = {
            label: '带宽',
            value: planDataMod.bandwidth,
          };
        }
        if (planDataMod.trafficVol) {
          let trafficTypeLabel = '双向';
          if (planDataMod.trafficType === '1') {
            trafficTypeLabel = '单向出';
          } else if (planDataMod.trafficType === '3') {
            trafficTypeLabel = '单向取最大';
          }
          obj.traffic = {
            label: `${trafficTypeLabel}流量`,
            value: planDataMod.trafficVol,
          };
        }
      }
    }
    return obj;
  });

  return {
    billAndPlan,
  };
};
