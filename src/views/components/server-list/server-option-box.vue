<template>
  <div
    class="server-option-box"
    :class="{
      'server-option-box--light-background': lightBackground,
      'server-option-box--mobile-hide': !mobileShow,
    }"
  >
    <div
      v-for="item in options"
      :key="item.key"
      class="server-option-item"
      :class="{
        'has-icon': item.icon,
        active: activeValue === item.value,
      }"
      :title="item?.title || false"
      @click="toggleModelValue(item)"
    >
      <i
        v-if="item.icon"
        class="option-icon"
        :class="item.icon"
        :title="item.label"
      />
      <span
        v-else
        class="option-label"
      >{{ item.label }}</span>
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
import config from '@/config';

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
  mobileShow: {
    type: Boolean,
    default: true,
  },
});

const emits = defineEmits([
  'update:modelValue',
]);

const lightBackground = computed(() => config.nazhua.lightBackground);

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

  @media screen and (max-width: 768px) {
    &--mobile-hide {
      display: none;
    }
  }

  .server-option-item {
    display: flex;
    align-items: center;
    height: 36px;
    padding: 0 15px;
    line-height: 1.2;
    border-radius: 6px;
    background: rgba(#000, 0.3);
    transition: all 0.3s linear;
    cursor: pointer;

    &.has-icon {
      padding: 0 10px;
    }

    @media screen and (max-width: 768px) {
      height: 30px;
      padding: 0 10px;
      border-radius: 3px;
      background-color: rgba(#000, 0.8);
      cursor: default;
    }

    .option-icon {
      line-height: 1;
      font-size: 18px;
    }

    .option-label {
      color: #fff;
      font-weight: bold;
      transition: all 0.3s linear;
    }

    @media screen and (min-width: 768px) {
      &:hover {
        .option-label {
          color: var(--option-high-color);
        }
      }
    }

    &.active {
      background: var(--option-high-color-active);

      .option-label {
        color: #fff;
      }
    }
  }

  @media screen and (min-width: 768px) {
    &--light-background {
      .server-option-item {
        background: rgba(#000, 0.5);

        &:hover {
          background: rgba(#000, 0.8);
        }

        &.active {
          background: var(--option-high-color-active);
        }
      }
    }
  }
}
</style>
