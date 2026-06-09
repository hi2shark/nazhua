<template>
  <server-list-column
    v-if="extraFields?.cycleTransfer"
    prop="cycle-transfer"
    label="周期流量"
    :slot-content="true"
  >
    <cycle-transfer-summary-text :summary="summary" />
  </server-list-column>
</template>

<script setup>
import {
  computed,
  inject,
} from 'vue';
import {
  getCycleTransferSummaryByServer,
} from '@/utils/cycle-transfer';
import CycleTransferSummaryText from '@/views/components/server-list/cycle-transfer-summary-text.vue';
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
const listCycleTransferMap = inject('listCycleTransferMap', {
  value: {},
});

const extraFields = computed(() => filterServerList.value?.fields || {});
const summary = computed(() => getCycleTransferSummaryByServer(listCycleTransferMap.value, props.info));
</script>
