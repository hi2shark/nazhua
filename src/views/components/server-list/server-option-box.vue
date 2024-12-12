<template>
  <div class="server-option-box">
    <div
      v-for="item in options"
      :key="item.key"
      class="server-option-item"
      :class="{
        active: activeValue === item.value,
      }"
      :title="item?.title || false"
      @click="toggleModelValue(item)"
    >
      <span class="option-label">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup>
/**
 * 过滤栏
 */
import {
  computed,
} from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
  accpetEmpty: {
    type: Boolean,
    default: true,
  },
});

const emits = defineEmits([
  'update:modelValue',
]);

const activeValue = computed({
  get: () => props.modelValue,
  set: (val) => {
    emits('update:modelValue', val);
  },
});

function toggleModelValue(item) {
  if (activeValue.value === item.value) {
    if (props.accpetEmpty) {
      activeValue.value = '';
    }
  } else {
    activeValue.value = item.value;
  }
}
</script>

<style lang="scss" scoped>
.server-option-box {
  display: flex;
  flex-wrap: wrap;
  padding: 0 var(--list-padding);
  gap: 8px;

  .server-option-item {
    display: flex;
    align-items: center;
    height: 36px;
    padding: 0 15px;
    line-height: 1.2;
    border-radius: 6px;
    background: rgba(#000, 0.3);
    cursor: pointer;
    @media screen and (max-width: 768px) {
      background-color: rgba(#000, 0.8);
      cursor: default;
    }

    .option-label {
      color: #fff;
    }

    &.active {
      background: rgba(#ff7500, 0.75);
    }
  }
}
</style>
