<template>
  <div
    class="server-list-item-status"
    :class="'type--' + componentName"
  >
    <component
      :is="componentMaps[componentName]"
      v-for="item in serverStatusList"
      :key="item.type"
      :type="item.type"
      :used="item.used"
      :colors="item.colors"
      :val-text="item.valText"
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
import ServerStatusProgress from '@/views/components/server/server-status-progress.vue';

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
.server-list-item-status {
  display: flex;
  justify-content: space-between;
  padding: 0 5px;

  &.type--progress {
    flex-wrap: wrap;
    gap: 10px;

    --progress-bar-height: 20px;

    @media screen and (max-width: 350px) {
      --progress-bar-height: 16px;
      padding: 0 15px;
    }
  }

  &.type--donut {
    --server-status-size: 120px;
    --server-status-val-text-font-size: 20px;
    --server-status-label-font-size: 14px;
    // 针对1440px以下的屏幕(新Mac笔记本或者windows缩放)
    @media screen and (max-width: 1440px) {
      padding: 0;
      --server-status-size: 110px;
      --server-status-val-text-font-size: 18px;
      --server-status-label-font-size: 14px;
    }
    // 针对1280px以下的屏幕(Mac居多)
    @media screen and (max-width: 1280px) {
      padding: 0 8px;
      --server-status-size: 100px;
      --server-status-val-text-font-size: 16px;
      --server-status-label-font-size: 12px;
    }
    // 针对1024px以下的屏幕(平板居多)
    @media screen and (max-width: 1024px) {
      // padding: 0 8px;
      --server-status-size: 120px;
      --server-status-val-text-font-size: 20px;
      --server-status-label-font-size: 16px;
    }
    @media screen and (max-width: 800px) {
      padding: 0 8px;
      --server-status-size: 100px;
      --server-status-val-text-font-size: 16px;
      --server-status-label-font-size: 12px;
    }
    @media screen and (max-width: 375px) {
      padding: 0;
      --server-status-size: 90px;
      --server-status-val-text-font-size: 14px;
      --server-status-label-font-size: 12px;
    }
  }
}
</style>
