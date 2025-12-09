<template>
  <div
    v-show="visible"
    ref="dropdownRef"
    class="server-sort-select-dropdown"
    :class="{
      'server-sort-select-dropdown--light-background': lightBackground,
      'server-sort-select-dropdown--mobile': isMobile,
    }"
    :style="dropdownStyle"
  >
    <div class="sort-select-options">
      <div
        v-for="item in options"
        :key="item.value"
        class="server-sort-item"
        :class="{
          active: activeValue === item.value,
        }"
        :title="item?.title || false"
        @click.stop="handleSelect(item, $event)"
      >
        <span class="option-label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  options: {
    type: Array,
    default: () => [],
  },
  activeValue: {
    type: String,
    default: '',
  },
  dropdownStyle: {
    type: Object,
    default: () => ({}),
  },
  lightBackground: {
    type: Boolean,
    default: false,
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['select']);

const dropdownRef = ref(null);

function handleSelect(item, event) {
  event.stopPropagation();
  emits('select', item);
}

defineExpose({
  dropdownRef,
});
</script>

<style lang="scss" scoped>
.server-sort-select-dropdown {
  z-index: 500;
  background: rgba(#000, 0.8);
  border-radius: 6px;
  padding: 10px;
  min-width: 150px;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  // 小屏居中显示样式
  &--mobile {
    min-width: 280px;
    max-width: 90vw;
    max-height: 70vh;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }
}

.sort-select-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.server-sort-item {
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 15px;
  line-height: 1.2;
  border-radius: 6px;
  background: rgba(#000, 0.3);
  transition: all 0.3s linear;
  cursor: pointer;

  .option-label {
    color: #fff;
    font-weight: bold;
    transition: all 0.3s linear;
  }

  &:hover {
    .option-label {
      color: var(--option-high-color);
    }
  }

  &.active {
    background: var(--option-high-color-active);

    .option-label {
      color: #fff;
    }
  }
}

// 浅色背景样式
.server-sort-select-dropdown--light-background {
  .server-sort-item {
    background: rgba(#000, 0.5);

    &:hover {
      background: rgba(#000, 0.8);
    }

    &.active {
      background: var(--option-high-color-active);
    }
  }
}
</style>
