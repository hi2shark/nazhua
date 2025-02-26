<template>
  <div
    v-for="item in serverStatusList"
    :key="item.type"
    class="list-column-item list-column-item--status"
    :class="`list-column-item--status-${componentName} list-column-item--status-type-${item.type}`"
  >
    <component
      :is="componentMaps[componentName]"
      :type="item.type"
      :used="item.used"
      :colors="item.colors"
      :val-text="item.valPercent"
      :val-percent="`${item.label}${$t('used')}${item.valText}`"
      :label="item.label"
    />
  </div>
</template>

<script setup>
/**
 * 服务器状态盒子
 */

import config from '@/config';

import handleServerStatus from '@/views/composable/server-status';
import ServerStatusDonut from '@/views/components/server/server-status-donut.vue';
import ServerStatusProgress from './server-list-item-status-progress.vue';

const props = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
});

const componentMaps = {
  donut: ServerStatusDonut,
  progress: ServerStatusProgress,
};

const componentName = [
  'donut',
  'progress',
].includes(config.nazhua.listServerStatusType) ? config.nazhua.listServerStatusType : 'donut';

const {
  serverStatusList,
} = handleServerStatus({
  props,
  statusListTpl: 'cpu,mem,disk',
  statusListItemContent: false,
});
</script>

<style lang="scss" scoped>
.list-column-item {
  &--status-progress {
    width: 72px;
    padding: 0 3px;
  }

  &--status-donut {
    --server-status-size: 66px;
    --server-status-label-scale: 0.8;
    --server-status-val-text-font-size: 16px;
    --server-status-label-font-size: 12px;
  }
}
</style>
