<template>
  <div class="country-content">
    <server-flag :info="info" />
    <span class="country-label">
      {{ countryLabel }}
    </span>
  </div>
</template>

<script setup>
/**
 * 地区信息
 */

import {
  computed,
} from 'vue';

const props = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
});

const countryLabel = computed(() => props.info?.Host?.CountryCode?.toUpperCase() || 'UN');
</script>

<style lang="scss" scoped>
.country-content {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
