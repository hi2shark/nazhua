<template>
  <div class="status-icon-box">
    <div
      class="status-icon"
      :class="{
        online: info.online === 1,
        offline: info.online === -1,
      }"
    />
  </div>
</template>

<script setup>
/**
 * 状态图标
 */
defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
});
</script>

<style lang="scss" scoped>
.status-icon-box {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-icon.online {
  background-image: linear-gradient(rgba(77, 133, 58, 1) 0, rgba(54, 126, 54, 1) 100%);
}

.status-icon.offline {
  background-image: linear-gradient(rgba(155, 37, 34, 1) 0, rgba(161, 38, 35, 1) 100%);
}
</style>
