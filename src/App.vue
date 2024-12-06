<template>
  <layout-main>
    <router-view />
  </layout-main>
</template>

<script setup>
import {
  ref,
  provide,
  onMounted,
} from 'vue';
import { useStore } from 'vuex';
import sleep from '@/utils/sleep';
import LayoutMain from './layout/main.vue';

import activeWebsocketService, {
  wsService,
  restart,
  msg,
} from './ws';

const store = useStore();

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

function handleSystem() {
  const isWindows = /windows|win32/i.test(navigator.userAgent);
  if (isWindows) {
    document.body.classList.add('windows');
  }
}

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
  handleSystem();
  refreshTime();

  /**
   * 初始化服务器信息
   */
  await store.dispatch('initServerInfo');

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
