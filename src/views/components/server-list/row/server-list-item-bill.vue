<template>
  <server-list-column
    v-if="extraFields?.remainingTime"
    prop="remaining-time"
    :label="$t('remainingTime')"
    :value="billAndPlan?.remainingTime?.value || '-'"
  />
  <server-list-column
    v-if="extraFields?.billing"
    prop="billing"
    :label="$t('billing')"
    :value="billAndPlan?.billing?.value || '-'"
  />
  <server-list-column
    v-if="extraFields?.orderLink"
    prop="order-link"
    :label="$t('orderLink')"
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
import {
  useI18n,
} from 'vue-i18n';

import config from '@/config';

import handleServerBillAndPlan from '@/views/composable/server-bill-and-plan';

import ServerListColumn from './server-list-column.vue';

const i18n = useI18n();

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

const buyBtnText = computed(() => {
  if (props.info?.PublicNote?.customData?.buyBtnText) {
    return props.info?.PublicNote?.customData?.buyBtnText;
  }
  return config.nazhua.buyBtnText || i18n.t('buy');
});
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

  &:hover {
    color: var(--list-item-buy-link-color-hover);
  }
}
</style>
