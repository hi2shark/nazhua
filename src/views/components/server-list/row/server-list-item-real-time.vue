<template>
  <server-list-column
    v-for="item in serverRealTimeList"
    :key="item.key"
    :prop="item.key"
    :label="item.label"
    :value="item.show ? item?.value : '-'"
    :unit="item.show ? item?.unit : ''"
  />
</template>

<script setup>
/**
 * 服务器数据统计
 */
import {
  inject,
} from 'vue';
import handleServerRealTime from '@/views/composable/server-real-time';

import ServerListColumn from './server-list-column.vue';

const props = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
  serverRealTimeListTpls: {
    type: String,
    default: undefined,
  },
});

const currentTime = inject('currentTime', {
  value: Date.now(),
});

const {
  serverRealTimeList,
} = handleServerRealTime({
  props,
  currentTime,
  serverRealTimeListTpls: props.serverRealTimeListTpls,
});
</script>
