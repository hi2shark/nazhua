<template>
  <server-list-column
    v-if="extraFields?.remainingTime"
    prop="remaining-time"
    label="剩余"
    :value="billAndPlan?.remainingTime?.value || '-'"
  />
  <server-list-column
    v-if="extraFields?.billing"
    prop="billing"
    label="费用"
    :value="billAndPlan?.billing?.value || '-'"
  />
  <server-list-column
    v-if="extraFields?.orderLink"
    prop="order-link"
    label="链接"
    wdith="80"
    :slot-content="true"
  >
    <span
      v-if="showBuyBtn"
      class="order-link"
      @click="toBuy"
    >
      {{ buyBtnText }}
    </span>
    <span v-else>-</span>
  </server-list-column>
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

import ServerListColumn from './server-list-column.vue';

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

function toBuy() {
  const decodeUrl = decodeURIComponent(props.info?.PublicNote?.customData?.orderLink);
  window.open(decodeUrl, '_blank');
}
</script>

<style lang="scss" scoped>
.order-link {
  color: var(--list-item-buy-link-color);
  cursor: pointer;
}
</style>
