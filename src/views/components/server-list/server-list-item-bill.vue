<template>
  <div class="server-list-item-bill">
    <div class="remaining-time-info">
      <template
        v-if="billAndPlan.remainingTime"
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
      </template>
    </div>
    <div class="billing-and-order-link">
      <div
        v-if="billAndPlan.billing"
        class="billing-info"
      >
        <span class="text">
          <span class="text-item value-text">{{ billAndPlan.billing.value }}</span>
          <span class="text-item">/</span>
          <span class="text-item label-text">{{ billAndPlan.billing.cycleLabel }}</span>
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

const buyBtnText = config.nazhua.buyBtnText || '购买';
const showBuyBtn = computed(() => !!props.info?.PublicNote?.customData?.orderLink);

function toBuy() {
  window.open(props.info?.PublicNote?.customData?.orderLink);
}
</script>

<style lang="scss" scoped>
.server-list-item-bill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  border-bottom-left-radius: var(--list-item-border-radius);
  border-bottom-right-radius: var(--list-item-border-radius);
  background: rgba(#000, 0.3);
  box-shadow: 0 -2px 4px rgba(#000, 0.5);

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

  .billing-and-order-link {
    display: flex;
    align-items: center;
    height: 40px;
    padding: 0 15px;
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
