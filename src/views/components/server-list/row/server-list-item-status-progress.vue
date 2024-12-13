<template>
  <div
    class="server-list-item-status-progress"
    :class="'server-status--' + type"
    :title="valPercent"
  >
    <span class="progress-label">
      {{ label }}
    </span>
    <div class="progress-bar">
      <div class="progress-bar-box">
        <div
          class="progress-bar-inner"
          :style="progressStyle"
        />
        <span
          class="progress-bar-used"
        >
          {{ valText }}
        </span>
      </div>
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
  valPercent: {
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
    if (Array.isArray(color)) {
      style.background = `linear-gradient(-35deg, ${color.join(',')})`;
    } else {
      style.backgroundColor = color;
    }
  }
  return style;
});
</script>

<style lang="scss" scoped>
.server-list-item-status-progress {
  --progress-label-height: 16px;
  --progress-bar-height: 24px;
  --progress-bar-box-height: 14px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: var(--list-item-height);

  .progress-label {
    padding-top: 6px; // 视觉修正
    line-height: var(--progress-label-height);
    font-size: 12px;
    color: #ccc;
  }

  .progress-bar {
    display: flex;
    align-items: center;
    width: 100%;
    height: var(--progress-bar-height);
  }

  .progress-bar-box {
    position: relative;
    width: 100%;
    height: var(--progress-bar-box-height);
    background: rgba(255, 255, 255, 0.2);
    border-radius: calc(var(--progress-bar-box-height) / 2);
    overflow: hidden;
  }

  .progress-bar-inner {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    background-color: #08f;
    border-radius: calc(var(--progress-bar-box-height) / 2);
    box-shadow: 2px 0 2px rgba(#000, 0.2);
  }

  .progress-bar-used {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    line-height: var(--progress-bar-box-height);
    font-size: 12px;
    text-align: center;
    text-shadow: 1px 1px 2px rgba(#000, 0.8), 0 0 1px rgba(#fff, 0.5);
    cursor: default;
  }
}
</style>
