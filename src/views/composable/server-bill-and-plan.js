import {
  computed,
} from 'vue';
import dayjs from 'dayjs';
import i18n from '@/i18n';
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
      // 默认1个月
      let months = 1;
      // 套餐资费
      let cycleLabel;
      if (validate.isSet(billingDataMod?.cycle)) {
        switch (billingDataMod.cycle.toLowerCase()) {
          case '月':
          case 'm':
          case 'mo':
          case 'month':
          case 'monthly':
            cycleLabel = i18n.global.t('monthly');
            months = 1;
            break;
          case '年':
          case 'y':
          case 'yr':
          case 'year':
          case 'annual':
            cycleLabel = i18n.global.t('yearly');
            months = 12;
            break;
          case '季':
          case 'quarterly':
            cycleLabel = i18n.global.t('quarterly');
            months = 3;
            break;
          case '半':
          case '半年':
          case 'h':
          case 'half':
          case 'semi-annually':
            cycleLabel = i18n.global.t('halfYearly');
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
          amountValue = i18n.global.t('payg');
          label = cycleLabel ? i18n.global.t('cycleLabel', { cycleLabel }) : '';
        } else if (billingDataMod.amount.toString() === '0') {
          amountValue = config.nazhua.freeAmount || i18n.global.t('free');
          isFree = true;
        } else {
          label = cycleLabel ? i18n.global.t('cycleLabelSuffix', { cycleLabel }) : '';
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
            label: i18n.global.t('remaining'),
            value: config.nazhua.infinityCycle || i18n.global.t('infinityCycle'),
            type: 'infinity',
          };
        } else if (autoRenewal === '1') {
          // 自动续费时间计算，cycleType 为 1 时为月，为 12 时为年
          // 判断endDate是否超过当前时间，超过则显示剩余时间
          if (endTime > nowTime) {
            const diff = dayjs(endTime).diff(dayjs(), 'day') + 1;
            obj.remainingTime = {
              label: i18n.global.t('remaining'),
              value: i18n.global.t('days', { count: diff }),
              value2: diff,
              type: 'autoRenewal-endTime',
            };
          } else {
            // endDate如果早于当前时间，按照cycleType计算出超过当前时间的结束时间
            const nextTime = dateUtils.getNextCycleTime(endTime, months, nowTime);
            const diff = dayjs(nextTime).diff(dayjs(), 'day') + 1;
            obj.remainingTime = {
              label: i18n.global.t('remaining'),
              value: i18n.global.t('days', { count: diff }),
              value2: diff,
              type: 'autoRenewal-nextTime',
            };
          }
        } else if (endTime > nowTime) {
          const diff = dayjs(endTime).diff(dayjs(), 'day') + 1;
          obj.remainingTime = {
            label: i18n.global.t('remaining'),
            value: i18n.global.t('days', { count: diff }),
            value2: diff,
            type: 'endTime',
          };
        } else {
          obj.remainingTime = {
            label: i18n.global.t('remaining'),
            value: i18n.global.t('expired'),
            type: 'expired',
          };
        }
      }
      // 带宽、流量
      if (planDataMod) {
        if (planDataMod.bandwidth) {
          obj.bandwidth = {
            label: i18n.global.t('bandwidth'),
            value: planDataMod.bandwidth,
          };
        }
        if (planDataMod.trafficVol) {
          let trafficTypeLabel = i18n.global.t('trafficDouble');
          if (planDataMod.trafficType === '1') {
            trafficTypeLabel = i18n.global.t('trafficSingleOut');
          } else if (planDataMod.trafficType === '3') {
            trafficTypeLabel = i18n.global.t('trafficSingleMax');
          }
          obj.traffic = {
            label: trafficTypeLabel,
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
