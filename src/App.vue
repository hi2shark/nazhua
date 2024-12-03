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
  msg,
} from './ws';

const store = useStore();

const currentTime = ref(0);

provide('currentTime', currentTime);

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

let stopReconnect = false;
async function wsReconnect() {
  if (stopReconnect) {
    return;
  }
  await sleep(1000);
  console.log('reconnect ws');
  activeWebsocketService();
}

onMounted(async () => {
  handleSystem();
  refreshTime();
  await store.dispatch('loadServers');
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
  activeWebsocketService();
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的rejection:', event.reason);
  event.preventDefault();
});
</script>
