<template>
  <div
    class="layout-header"
    :class="headerClass"
    :style="headerStyle"
  >
    <div class="layer-header-container">
      <div class="left-box">
        <span
          class="site-name"
          @click="toHome"
        >{{ title }}</span>
      </div>
      <div class="right-box">
        <server-count
          v-if="showServerCount"
        />
        <server-stat
          v-if="showServerStat"
        />
        <dashboard-btn
          v-if="showDashboardBtn"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * LayoutHeader
 */
import {
  computed,
} from 'vue';
import {
  useRoute,
  useRouter,
} from 'vue-router';

import config from '@/config';

import ServerCount from './server-count.vue';
import ServerStat from './server-stat.vue';
import DashboardBtn from './dashboard-btn.vue';

const route = useRoute();
const router = useRouter();

const lightBackground = computed(() => config.nazhua.lightBackground);

const headerStyle = computed(() => {
  const style = {};
  if (route.name === 'ServerDetail') {
    style['--layout-header-container-width'] = 'var(--detail-container-width)';
  } else {
    style['--layout-header-container-width'] = 'var(--list-container-width)';
  }
  return style;
});

const showServerCount = computed(() => config.nazhua.hideNavbarServerCount !== true);

const showServerStat = computed(() => config.nazhua.hideNavbarServerStat !== true);

const title = computed(() => config.nazhua.title);

const headerClass = computed(() => {
  const classes = [];
  if (route.name === 'ServerDetail') {
    classes.push('layout-header--detail');
  }
  if (showServerStat.value) {
    classes.push('layout-header--show-server-stat');
  }
  if (showServerCount.value) {
    classes.push('layout-header--show-server-count');
  }
  if (lightBackground.value) {
    classes.push('layout-header--light-background');
  }
  return classes;
});

function toHome() {
  if (route.name !== 'Home') {
    router.push({
      name: 'Home',
    });
  }
}

const showDashboardBtn = computed(() => [
  config.nazhua.nezhaVersion === 'v1',
  config.nazhua.v1HideNezhaDashboardBtn !== true,
].every((item) => item));
</script>

<style lang="scss" scoped>
.layout-header {
  position: sticky;
  top: 0;
  z-index: 100;
  min-height: var(--layout-header-height);
  background-position: 0% 0%;
  background-image: radial-gradient(transparent 1px, rgba(#000, 0.8) 2px);
  background-size: 3px 3px;
  backdrop-filter: saturate(50%) blur(3px);
  box-shadow: 0 2px 4px rgba(#000, 0.2);

  &--show-server-stat {
    @media screen and (max-width: 450px) {
      padding-top: 10px;
    }
  }

  &--light-background {
    background-color: rgba(#000, 0.7);
    background-image: none;
    backdrop-filter: none;
  }

  .site-name {
    line-height: calc(var(--layout-header-height) - 20px);
    font-size: 24px;
    font-weight: bold;
    color: #fff;
    text-shadow: 2px 2px 4px rgba(#000, 0.5);
    cursor: pointer;
  }

  .layer-header-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0 20px;
    width: var(--layout-header-container-width, 100%);
    margin: auto;
    padding: 10px 20px;
    transition: width 0.3s;
  }

  .right-box {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0 20px;
    color: #ddd;
  }
}
</style>
