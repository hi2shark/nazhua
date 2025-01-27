<template>
  <div
    class="layout-group"
    :style="layoutGroupStyle"
  >
    <div
      class="layout-bg"
      :style="layoutBGStyle"
    />
    <div class="layout-main">
      <layout-header />
      <slot />
      <layout-footer />

      <search-box
        v-if="enableInnerSearch"
      />
    </div>
    <template v-if="showFireworks">
      <fireworks />
    </template>
    <template v-if="config.nazhua.showLantern">
      <lantern />
    </template>
  </div>
</template>

<script setup>
/**
 * LayoutMain
 */
import {
  ref,
  computed,
} from 'vue';
import config from '@/config';
import Fireworks from '@/components/fireworks.vue';
import Lantern from '@/components/lantern.vue';
import LayoutHeader from './components/header.vue';
import LayoutFooter from './components/footer.vue';
import SearchBox from './components/search-box.vue';

const windowWidth = ref(window.innerWidth);

const layoutGroupStyle = computed(() => {
  const style = {};
  if (config.nazhua.lightBackground) {
    style['--layout-main-bg-color'] = 'rgba(20, 30, 40, 0.2)';
  }
  return style;
});

const layoutBGStyle = computed(() => {
  const style = {};
  if (config.nazhua.customBackgroundImage) {
    style.background = `url(${config.nazhua.customBackgroundImage}) 50% 50%`;
    style.backgroundSize = 'cover';
  }
  return style;
});

const showFireworks = computed(() => {
  if (windowWidth.value < 800) {
    return false;
  }
  return config.nazhua.showFireworks;
});

const enableInnerSearch = computed(() => {
  if (typeof config.nazhua.enableInnerSearch === 'undefined') {
    return true;
  }
  return config.nazhua.enableInnerSearch;
});

window.addEventListener('resize', () => {
  windowWidth.value = window.innerWidth;
});
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
    background: var(--layout-bg-color) url('~@/assets/images/bg.webp') no-repeat 50% 100%;
    background-size: 100% auto;
  }
}
</style>
