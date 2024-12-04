<template>
  <div
    class="server-status-progress"
    :class="'server-status--' + type"
  >
    <div class="progress-bar-box">
      <div
        class="progress-bar-inner"
        :style="progressStyle"
      />
      <div
        class="progress-bar-label"
        :title="label + '使用' + used + '%'"
      >
        <span class="server-status-label">
          {{ label }}:
        </span>
        <span class="server-status-val-text">
          {{ valText }}
        </span>
      </div>
    </div>

    <div
      v-if="content"
      class="server-status-progress-content"
    >
      <span>{{ content?.default }}</span>
    </div>
  </div>
</template>

<script setup>
/**
 * 服务器状态进度调单项
 */

import {
  computed,
} from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: '',
  },
  size: {
    type: Number,
    default: 100,
  },
  used: {
    type: [Number, String],
    default: 1,
  },
  colors: {
    type: Object,
    default: () => ({}),
  },
  valText: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  content: {
    type: [String, Object],
    default: '',
  },
});

const progressStyle = computed(() => {
  const style = {};
  style.width = `${Math.min(props.used, 100)}%`;
  const color = typeof props.colors === 'string' ? props.colors : props.colors?.used;
  if (color) {
    style.backgroundColor = color;
  }
  return style;
});
</script>

<style lang="scss" scoped>
.server-status-progress {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;

  @media screen and (max-width: 480px) {
    flex: none;
    width: calc(50% - 5px);
  }

  @media screen and (max-width: 350px) {
    flex: none;
    width: 100%;
  }

  .progress-bar-box {
    position: relative;
    width: 100%;
    height: var(--progress-bar-height);
    background: rgba(255, 255, 255, 0.2);
    border-radius: var(--progress-bar-height);
    overflow: hidden;
  }

  .progress-bar-inner {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    background-color: #08f;
    border-radius: var(--progress-bar-height);
  }

  .progress-bar-label {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    line-height: var(--progress-bar-height);
    font-size: 12px;
    text-align: center;
    text-shadow: 1px 1px 2px rgba(#000, 0.8), 0 0 1px rgba(#fff, 0.5);
    cursor: default;
  }

  .server-status-val-text {
    color: #a1eafb;
  }
  .server-status-label {
    color: #ddd;
  }

  .server-status-progress-content {
    color: #eee;
    @media screen and (max-width: 480px) {
      line-height: 20px;
      font-size: 12px;
    }
  }
}
</style>
