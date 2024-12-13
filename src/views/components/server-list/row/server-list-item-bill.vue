<template>
  <div
    v-if="extraFields?.remainingTime"
    class="list-column-item list-column-item--remaining-time"
  >
    <div class="list-column-item-content">
      <span class="item-label">剩余</span>
      <div class="item-content">
        <span class="text-item value-text">{{ billAndPlan?.remainingTime?.value || '-' }}</span>
      </div>
    </div>
  </div>
  <div
    v-if="extraFields?.billing"
    class="list-column-item list-column-item--billing"
  >
    <div class="list-column-item-content">
      <span
        v-if="!billAndPlan?.billing?.isFree && billAndPlan?.billing?.label"
        class="item-label"
      >
        {{ billAndPlan.billing.label }}
      </span>
      <div class="item-content">
        <span class="text-item value-text">{{ billAndPlan?.billing?.value || '-' }}</span>
      </div>
    </div>
  </div>
  <div
    v-if="extraFields?.orderLink"
    class="list-column-item list-column-item--order-link"
  >
    <div class="list-column-item-content">
      <span class="item-label">链接</span>
      <div class="item-content">
        <span
          v-if="showBuyBtn"
          class="text-item value-text"
          @click="toBuy"
        >
          {{ buyBtnText }}
        </span>
        <span v-else>-</span>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 套餐信息
 */
import {
  inject,
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

const filterServerList = inject('filterServerList', {
  value: null,
});

const extraFields = computed(() => filterServerList.value?.fields || {});

const {
  billAndPlan,
} = handleServerBillAndPlan({
  props,
});

const buyBtnText = computed(() => config.nazhua.buyBtnText || '购买');
const showBuyBtn = computed(() => !!props.info?.PublicNote?.customData?.orderLink);

// function toBuy() {
//   const decodeUrl = decodeURIComponent(props.info?.PublicNote?.customData?.orderLink);
//   window.open(decodeUrl, '_blank');
// }
</script>

<style lang="scss" scoped>
.list-column-item {

  .list-column-item-content {
    --item-content-label-height: 16px;
    --item-content-value-height: 24px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: var(--list-item-height);

    .item-label {
      padding-top: 6px; // 视觉修正
      line-height: var(--item-content-label-height);
      font-size: 12px;
      color: #ccc;
    }

    .item-content {
      line-height: var(--item-content-value-height);
      font-size: 14px;
    }
  }

  &--remaining-time {
    width: 60px;

    .value-text {
      color: #74dbef;
    }
  }

  &--billing {
    width: 60px;

    .value-text {
      color: var(--list-item-price-color);
    }
  }

  &--order-link {
    width: 60px;

    .value-text {
      color: var(--list-item-buy-link-color);
      cursor: pointer;
    }
  }
}
</style>
