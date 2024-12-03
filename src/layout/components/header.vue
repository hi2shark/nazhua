<template>
  <div
    class="layout-header"
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
        <div
          v-if="serverCount?.total"
          class="server-count-group"
        >
          <span class="server-count server-count--total">
            <span class="text">共</span>
            <span class="value">{{ serverCount.total }}</span>
            <span class="text">台服务器</span>
          </span>
          <span
            v-if="serverCount.online !== serverCount.total"
            class="server-count server-count--online"
          >
            <span class="text">在线</span>
            <span class="value">{{ serverCount.online }}</span>
          </span>
          <span
            v-if="serverCount.offline"
            class="server-count server-count--offline"
          >
            <span class="text">离线</span>
            <span class="value">{{ serverCount.offline }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * LayoutHeader
 */
import {
  ref,
  computed,
  onMounted,
} from 'vue';
import {
  useStore,
} from 'vuex';
import {
  useRoute,
  useRouter,
} from 'vue-router';
import config from '@/config';

const store = useStore();
const route = useRoute();
const router = useRouter();

const headerStyle = computed(() => {
  const style = {};
  if (route.name === 'ServerDetail') {
    style['--layout-header-container-width'] = 'var(--detail-container-width)';
  } else {
    style['--layout-header-container-width'] = 'var(--list-container-width)';
  }
  return style;
});

const serverCount = computed(() => store.state.serverCount);

const title = ref(config.nazhua.title);

function toHome() {
  if (route.name !== 'Home') {
    router.push({
      name: 'Home',
    });
  }
}

onMounted(() => {
  title.value = config.nazhua.title;
});
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

  .site-name {
    line-height: calc(var(--layout-header-height) - 20px);
    font-size: 24px;
    color: #fff;
    text-shadow: 2px 2px 4px rgba(#000, 0.5);
    cursor: pointer;
  }

  .server-count-group {
    display: flex;
    gap: 20px;
    line-height: 30px;
  }

  .server-count {
    display: flex;
    align-items: center;
    gap: 3px;
    color: #ddd;

    &.server-count--total {
      .value {
        color: #70f3ff;
      }
    }
    &.server-count--online {
      .value {
        color: #0f0;
      }
    }
    &.server-count--offline {
      .value {
        color: #f00;
      }
    }
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
}
</style>
