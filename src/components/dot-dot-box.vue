<template>
  <div
    class="dot-dot-box"
    :class="{
      'dot-dot-box--hide': $config.nazhua?.hideDotBG === true,
    }"
    :style="boxStyle"
  >
    <slot />
  </div>
</template>

<script setup>
/**
 * 点格子背景盒子
 */

import { computed } from 'vue';

const props = defineProps({
  borderRadius: {
    type: [String, Number],
    default: 12,
  },
  padding: {
    type: [String, Number],
    default: 20,
  },
  color: {
    type: String,
    default: '#eee',
  },
});

const boxStyle = computed(() => {
  const style = {};
  if (props.borderRadius) {
    if (typeof props.borderRadius === 'number') {
      style['--border-radius'] = `${props.borderRadius}px`;
    } else {
      style['--border-radius'] = `${props.borderRadius}`;
    }
  }
  if (props.padding) {
    if (typeof props.padding === 'number') {
      style.padding = `${props.padding}px`;
    } else {
      style.padding = props.padding;
    }
  }
  if (props.color) {
    style.color = props.color;
  }
  return style;
});

</script>

<style lang="scss" scoped>
.dot-dot-box {
  --border-radius: 12px;
  color: #eee;
  border-radius: var(--border-radius);
  box-shadow: 2px 4px 6px rgba(#000, 0.4);

  background-image: radial-gradient(transparent 1px, rgba(#000, 0.6) 1px);
  background-size: 3px 3px;
  backdrop-filter: saturate(50%) blur(3px);

  &--hide {
    background-color: rgba(#000, 0.8);
    background-image: none;
    backdrop-filter: none;
  }

  @media screen and (max-width: 768px) {
    background-color: rgba(#000, 0.8);
    background-image: none;
    backdrop-filter: none;
  }
}

</style>
