<template>
  <div class="layout-group">
    <div class="layout-bg" />
    <div class="layout-main">
      <layout-header />
      <slot />
      <layout-footer />
    </div>
  </div>
</template>

<script setup>
/**
 * LayoutMain
 */
import LayoutHeader from './components/header.vue';
import LayoutFooter from './components/footer.vue';
</script>

<style lang="scss" scoped>
.layout-group {
  position: relative;
  width: 100%;
  min-height: 100vh;

  .layout-main {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: var(--layout-main-bg-color);
  }

  .layout-bg {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    background: var(--layout-bg-color) url('~@/assets/images/bg.webp') no-repeat 50% 0%;
    background-size: 100% auto;
  }
}
</style>
