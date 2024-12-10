<template>
  <layout-main>
    <router-view />
  </layout-main>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  provide,
  onMounted,
} from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import config, {
  init as initConfig,
} from '@/config';
import sleep from '@/utils/sleep';
import LayoutMain from './layout/main.vue';

import activeWebsocketService, {
  wsService,
  restart,
  msg,
} from './ws';

const store = useStore();
const route = useRoute();

const currentTime = ref(0);

provide('currentTime', currentTime);

/**
 * 刷新当前时间
 */
function refreshTime() {
  currentTime.value = Date.now();
  setTimeout(() => {
    refreshTime();
  }, 1000);
}

// 是否为Windows系统
const isWindows = /windows|win32/i.test(navigator.userAgent);
if (isWindows) {
  document.body.classList.add('windows');
}
// 是否加载Sarasa Term SC字体
const loadSarasaTermSC = computed(() => config.nazhua.disableSarasaTermSC !== true);
watch(loadSarasaTermSC, (value) => {
  if (value) {
    document.body.classList.add('sarasa-term-sc');
  } else {
    document.body.classList.remove('sarasa-term-sc');
  }
}, {
  immediate: true,
});

/**
 * websocket断连的自动重连
 */
let stopReconnect = false;
async function wsReconnect() {
  if (stopReconnect) {
    return;
  }
  stopReconnect = true;
  await sleep(1000);
  console.log('reconnect ws');
  activeWebsocketService();
  stopReconnect = false;
}

onMounted(async () => {
  refreshTime();

  // 如果没有配置哪吒版本，尝试载入 v1 版本配置
  if (!config.init) {
    await initConfig();
  }

  /**
   * 初始化服务器信息
   */
  await store.dispatch('initServerInfo', {
    route,
  });

  /**
   * 初始化WS重连维护
   */
  msg.on('close', () => {
    console.log('ws closed');
    wsReconnect();
  });
  msg.on('error', () => {
    console.log('ws error');
    stopReconnect = true;
  });
  msg.on('connect', () => {
    console.log('ws connected');
    store.dispatch('watchWsMsg');
  });
  window.addEventListener('focus', () => {
    // ws在离开焦点后出现断连，尝试重新连接
    // 暂定仅针对-1状态进行重连
    if ([-1].includes(wsService.connected)) {
      restart();
    }
  });
  /**
   * 激活websocket服务
   */
  activeWebsocketService();
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的rejection:', event.reason);
  event.preventDefault();
});
</script>
