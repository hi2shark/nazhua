<template>
  <div class="system-os-content">
    <span class="system-icon">
      <span :class="platformLogoIconClassName" />
    </span>
    <span class="system-label">
      {{ systemOSLabel }}
    </span>
  </div>
</template>

<script setup>
/**
 * 系统信息
 */

import {
  computed,
} from 'vue';
import * as hostUtils from '@/utils/host';

const props = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
});

const platformLogoIconClassName = computed(() => hostUtils.getPlatformLogoIconClassName(props.info?.Host?.Platform));
const systemOSLabel = computed(() => hostUtils.getSystemOSLabel(props.info?.Host?.Platform, true));
</script>

<style lang="scss" scoped>
.system-os-content {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
