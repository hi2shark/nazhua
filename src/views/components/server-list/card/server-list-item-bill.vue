<template>
  <div
    v-if="show"
    class="server-list-item-bill"
    :class="{
      'dot-dot-box--hide': $config.nazhua?.hideDotBG === true,
    }"
  >
    <div class="left-box">
      <div
        v-if="billAndPlan.remainingTime"
        class="remaining-time-info"
      >
        <span class="icon">
          <span class="ri-hourglass-fill" />
        </span>
        <span
          v-if="billAndPlan.remainingTime.type !== 'infinity'"
          class="text"
        >
          <span class="text-item label-text">{{ billAndPlan.remainingTime.label }}</span>
          <span class="text-item value-text">{{ billAndPlan.remainingTime.value }}</span>
        </span>
        <span
          v-else
          class="text"
        >
          <span class="text-item value-text">{{ billAndPlan.remainingTime.value }}</span>
        </span>
      </div>
      <div
        v-else-if="tagList"
        class="tag-list"
      >
        <span
          v-for="(tagItem, index) in tagList"
          :key="`${tagItem}_${index}`"
          class="tag-item"
          :class="{
            'has-sarasa-term': $hasSarasaTerm && config.nazhua.disableSarasaTermSC !== true,
          }"
        >
          {{ tagItem }}
        </span>
      </div>
    </div>
    <div class="billing-and-order-link">
      <div
        v-if="billAndPlan.billing"
        class="billing-info"
      >
        <span class="text">
          <span class="text-item value-text">{{ billAndPlan.billing.value }}</span>
          <template v-if="!billAndPlan.billing.isFree && billAndPlan.billing.cycleLabel">
            <span class="text-item">/</span>
            <span class="text-item label-text">{{ billAndPlan.billing.cycleLabel }}</span>
          </template>
        </span>
      </div>
      <div
        v-if="showBuyBtn"
        class="buy-btn"
        @click.stop="toBuy"
      >
        <span class="icon">
          <span class="ri-shopping-bag-3-line" />
        </span>
        <span class="text">{{ buyBtnText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 套餐信息
 */
import {
  computed,
} from 'vue';

import config from '@/config';

import handleServerBillAndPlan from '@/views/composable/server-bill-and-plan';

const props = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
});

const {
  billAndPlan,
} = handleServerBillAndPlan({
  props,
});

const buyBtnText = computed(() => config.nazhua.buyBtnText || '购买');
const showBuyBtn = computed(() => !!props.info?.PublicNote?.customData?.orderLink);

function toBuy() {
  const decodeUrl = decodeURIComponent(props.info?.PublicNote?.customData?.orderLink);
  window.open(decodeUrl, '_blank');
}

const tagList = computed(() => {
  const list = [];
  const {
    networkRoute,
    extra,
    IPv4,
    IPv6,
  } = props?.info?.PublicNote?.planDataMod || {};
  if (networkRoute) {
    list.push(...networkRoute.split(','));
  }
  if (extra) {
    list.push(...extra.split(','));
  }
  if (IPv4 === '1' && IPv6 === '1') {
    list.push('双栈IP');
  } else if (IPv4 === '1') {
    list.push('仅IPv4');
  } else if (IPv6 === '1') {
    list.push('仅IPv6');
  }
  // 列表最多显示5个标签
  return list.slice(0, 5);
});

const show = computed(() => {
  const checks = [
    billAndPlan.value.remainingTime,
    billAndPlan.value.billing,
    tagList.value.length > 0,
    showBuyBtn.value,
  ];
  return checks.some((item) => item);
});
</script>

<style lang="scss" scoped>
.server-list-item-bill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  height: 40px;
  border-bottom-left-radius: var(--list-item-border-radius);
  border-bottom-right-radius: var(--list-item-border-radius);
  background: rgba(#000, 0.3);
  box-shadow: 0 -2px 4px rgba(#000, 0.5);

  &.dot-dot-box--hide {
    box-shadow: none;
    border-top: 1px solid rgba(#ddd, 0.1);
  }

  .left-box {
    display: flex;
  }

  .remaining-time-info {
    display: flex;
    align-items: center;
    padding-left: 8px;

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      line-height: 1;
      font-size: 16px;
      color: #74dbef;
    }

    .text {
      display: flex;
      align-items: center;
      line-height: 30px;
      color: #ddd;
    }

    .value-text {
      color: #74dbef;
    }
  }

  .tag-list {
    display: flex;
    gap: 6px;
    padding-left: 15px;
    // 折行隐藏
    height: 18px;
    overflow: hidden;

    .tag-item {
      height: 18px;
      padding: 0 4px;
      line-height: 18px;
      font-size: 12px;
      color: var(--public-note-tag-color);
      background: var(--public-note-tag-bg);
      text-shadow: 1px 1px 2px rgba(#000, 0.2);
      border-radius: 4px;

      &.has-sarasa-term {
        line-height: 20px;
      }
    }
  }

  .billing-and-order-link {
    display: flex;
    align-items: center;
    height: 40px;
    padding-right: 15px;
    gap: 10px;

    .billing-info {
      line-height: 30px;
      color: var(--list-item-price-color);
    }

    .buy-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 30px;
      padding: 0 6px;
      gap: 5px;
      line-height: 1;
      font-weight: bold;
      color: var(--list-item-buy-link-color);
      border: 2px solid var(--list-item-buy-link-color);
      border-radius: 8px;
      transition: all 150ms ease;
      cursor: pointer;

      &:hover {
        color: #111;
        border-color: var(--list-item-buy-link-color);
        background-color: var(--list-item-buy-link-color);
      }

      @media screen and (max-width: 768px) {
        cursor: default;
      }
    }
  }
}
</style>
