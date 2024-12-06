<template>
  <dot-dot-box
    padding="15px"
    class="server-status-and-real-time"
    :class="{
      'status-type--progress': componentName === 'progress',
    }"
  >
    <div
      class="server-status-group"
      :class="'type--' + componentName + ' status-list--' + serverStatusList.length"
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
        :content="item.content"
      />
    </div>
    <server-list-item-real-time :info="info" />
  </dot-dot-box>
</template>

<script setup>
/**
 * 服务器状态组
 */

import config from '@/config';

import handleServerStatus from '@/views/composable/server-status';

import ServerListItemRealTime from '@/views/components/server/server-real-time.vue';
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
].includes(config.nazhua.detailServerStatusType) ? config.nazhua.detailServerStatusType : 'donut';

const {
  serverStatusList,
} = handleServerStatus({
  props,
  statusListTpl: 'cpu,mem,swap,disk',
  statusListItemContent: true,
});
</script>

<style lang="scss" scoped>
.server-status-and-real-time {
  display: flex;
  flex-direction: column;
  gap: 20px;

  --real-time-value-font-size: 36px;
  --real-time-text-font-size: 16px;
  --real-time-label-font-size: 16px;

  &.status-type--progress {
    --real-time-value-font-size: 24px;
    --real-time-text-font-size: 14px;
    --real-time-label-font-size: 14px;

    @media screen and (max-width: 1024px) {
      --real-time-value-font-size: 24px;
    }
  }

  @media screen and (max-width: 1024px) {
    --real-time-value-font-size: 30px;
  }

  @media screen and (max-width: 720px) {
    --real-time-value-font-size: 24px;
    --real-time-text-font-size: 14px;
    --real-time-label-font-size: 14px;
  }

  @media screen and (max-width: 320px) {
    --real-time-value-font-size: 20px;
    --real-time-text-font-size: 12px;
    --real-time-label-font-size: 12px;
  }
}

.server-status-group {
  display: flex;
  flex-wrap: wrap;

  &.type--donut {
    &.status-list--3 {
      --server-status-size: 200px;
      --server-status-val-text-font-size: 32px;
      --server-status-label-font-size: 18px;
      --server-status-content-font-size: 16px;
    }

    &.status-list--4 {
      --server-status-size: 180px;
      --server-status-val-text-font-size: 28px;
      --server-status-label-font-size: 16px;
      --server-status-content-font-size: 16px;
    }

    @media screen and (max-width: 800px) {
      // gap: 10px 20px;

      &.status-list--4 {
        --server-status-size: 160px;
        --server-status-val-text-font-size: 26px;
        --server-status-label-font-size: 15px;
        --server-status-content-font-size: 14px;
      }
    }

    @media screen and (max-width: 720px) {
      gap: 0;
    }

    @media screen and (max-width: 480px) {
      &.status-list--3 {
        --server-status-size: 100px;
        --server-status-val-text-font-size: 14px;
        --server-status-label-font-size: 12px;
        --server-status-content-font-size: 12px;
      }

      &.status-list--4 {
        padding: 0 10px;
        gap: 10px 0;
        --server-status-size: 120px;
        --server-status-val-text-font-size: 16px;
        --server-status-label-font-size: 14px;
        --server-status-content-font-size: 14px;
      }
    }

    @media screen and (max-width: 400px) {
      &.status-list--3 {
        --server-status-size: 90px;
        --server-status-val-text-font-size: 12px;
        --server-status-label-font-size: 12px;
        --server-status-content-font-size: 12px;
      }
    }

    @media screen and (max-width: 320px) {
      &.status-list--3 {
        --server-status-size: 90px;
      }
      &.status-list--4 {
        padding: 0;
        --server-status-size: 100px;
        --server-status-val-text-font-size: 14px;
        --server-status-label-font-size: 12px;
        --server-status-content-font-size: 12px;
      }
    }
  }

  &.type--progress {
    padding: 0 5px;
    gap: 10px;

    --progress-bar-height: 24px;

    @media screen and (max-width: 350px) {
      --progress-bar-height: 16px;
    }
  }
}
</style>
