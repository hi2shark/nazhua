<template>
  <cycle-transfer-summary-text :summary="summary" />
</template>

<script setup>
import CycleTransferSummaryText from '@/views/components/server-list/cycle-transfer-summary-text.vue';

defineProps({
  summary: {
    type: Object,
    default: null,
  },
});
</script>
