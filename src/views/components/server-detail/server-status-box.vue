<template>
  <div class="server-status-and-real-time">
    <div
      class="server-status-group"
      :class="'status-list--' + serverStatusList.length"
    >
      <server-status-item
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
  </div>
</template>

<script setup>
/**
 * 服务器状态组
 */
import handleServerStatus from '@/views/composable/server-status';

import ServerStatusItem from '@/views/components/server/server-status.vue';
import ServerListItemRealTime from '@/views/components/server/server-real-time.vue';

const props = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
});

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
  padding: 15px;
  border-radius: 12px;
  background-image: radial-gradient(transparent 1px, rgba(#000, 0.6) 1px);
  background-size: 3px 3px;
  backdrop-filter: saturate(50%) blur(3px);
  box-shadow: 2px 4px 6px rgba(#000, 0.4);

  --real-time-value-font-size: 36px;
  --real-time-text-font-size: 16px;
  --real-time-label-font-size: 16px;

  @media screen and (max-width: 1024px) {
    --real-time-value-font-size: 30px;
  }

  @media screen and  (max-width: 768px) {
    background-color: rgba(#000, 0.8);
    background-image: none;
    backdrop-filter: none;
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
</style>
