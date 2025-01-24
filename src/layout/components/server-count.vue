<template>
  <div
    v-if="serverCount?.total"
    class="server-count-group"
  >
    <span class="server-count server-count--total">
      <span class="text">共</span>
      <span class="value">{{ serverCount.total }}</span>
      <span class="text">台服务器</span>
    </span>
    <template v-if="serverCount.online !== serverCount.total">
      <span
        class="server-count server-count--online"
      >
        <span class="text">在线</span>
        <span class="value">{{ serverCount.online }}</span>
      </span>
      <span
        class="server-count server-count--offline"
      >
        <span class="text">离线</span>
        <span class="value">{{ serverCount.offline }}</span>
      </span>
    </template>
  </div>
</template>

<script setup>
/**
 * 服务器数量
 */
import {
  computed,
} from 'vue';
import {
  useStore,
} from 'vuex';

const store = useStore();

const serverCount = computed(() => store.state.serverCount);
</script>

<style lang="scss" scoped>
.server-count-group {
  display: flex;
  gap: 10px;

  .server-count {
    display: flex;
    align-items: center;
    gap: 3px;
    color: #ddd;
    line-height: 30px;

    .value {
      font-weight: bold;
    }

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
}
</style>
