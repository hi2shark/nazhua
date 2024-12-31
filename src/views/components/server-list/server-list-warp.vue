<template>
  <transition-group
    v-if="showTransition"
    name="list"
    tag="div"
    class="server-list-container"
    :class="{
      'server-list--row': showListRow,
      'server-list--card': showListCard,
    }"
  >
    <slot />
  </transition-group>
  <div
    v-else
    class="server-list-container"
    :class="{
      'server-list--row': showListRow,
      'server-list--card': showListCard,
    }"
  >
    <slot />
  </div>
</template>

<script setup>
/**
 * 服务器列表
 */

defineProps({
  showTransition: {
    type: Boolean,
    default: true,
  },
  showListRow: {
    type: Boolean,
    default: false,
  },
  showListCard: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="scss" scoped>
.server-list-container.server-list--card {
  --list-padding: 20px;
  --list-gap-size: 20px;
  --list-item-num: 3;
  --list-item-width: calc(
    (
      var(--list-container-width)
      - (var(--list-padding) * 2)
      - (
        var(--list-gap-size)
        * (var(--list-item-num) - 1)
        )
    )
    / var(--list-item-num)
  );
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: var(--list-gap-size);
  padding: 0 var(--list-padding);
  width: var(--list-container-width);
  margin: auto;

  // 针对1440px以下的屏幕
  @media screen and (max-width: 1440px) {
    --list-gap-size: 10px;
  }

  @media screen and (max-width: 1024px) {
    --list-item-num: 2;
  }

  @media screen and (max-width: 680px) {
    --list-item-num: 1;
  }
}

.server-list-container.server-list--row {
  --list-padding: 20px;
  --list-gap-size: 12px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--list-gap-size);
  width: var(--list-container-width);
  padding: 0 var(--list-padding);
  margin: auto;
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
.list-leave-active {
  position: absolute;
}
</style>
