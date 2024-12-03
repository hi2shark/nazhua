<template>
  <div
    ref="pointRef"
    class="world-map-point"
    :style="pointStyle"
    :title="info?.label || ''"
    @click="handleClick"
  >
    <div class="point-block" />
  </div>
</template>

<script setup>
/**
 * 世界地图点
 */

import {
  ref,
  computed,
} from 'vue';

const props = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
});

const emits = defineEmits([
  'point-tap',
]);

const pointRef = ref();

const pointStyle = computed(() => {
  const style = {};
  style['--map-point-left'] = `${props.info.left}px`;
  style['--map-point-top'] = `${props.info.top}px`;
  if (props.info?.size) {
    style['--map-point-size'] = `${props.info.size}px`;
  }
  return style;
});

function handleClick() {
  emits('point-tap', props.info);
}
</script>

<style lang="scss" scoped>
.world-map-point {
  --map-point-size: 6px;
  --map-point-scale: 1;
  position: absolute;
  left: var(--map-point-left);
  top: var(--map-point-top);
  width: 16px;
  height: 16px;
  transform: translate(-50%, -50%);

  .point-block {
    position: absolute;
    top: 50%;
    left: 50%;
    width: calc(var(--map-point-size) * var(--map-point-scale));
    height: calc(var(--map-point-size) * var(--map-point-scale));
    transform: translate(-50%, -50%);
    background: var(--world-map-point-color);
    border-radius: 50%;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: calc(var(--map-point-size) * var(--map-point-scale) + (8px * var(--map-point-scale)));
      height: calc(var(--map-point-size) * var(--map-point-scale) + (8px * var(--map-point-scale)));
      transform: translate(-50%, -50%);
      border: calc(2px * var(--map-point-scale)) solid var(--world-map-point-color);
      border-radius: 50%;
    }
  }

  @media screen and (max-width: 720px) {
    --map-point-scale: 0.5;
  }
}
</style>
