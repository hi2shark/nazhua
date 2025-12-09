<template>
  <div
    class="server-sort-box"
    :class="{
      'server-sort-box--light-background': lightBackground,
      'server-sort-box--mobile-hide': !mobileShow,
    }"
  >
    <div
      ref="triggerRef"
      class="sort-select-wrapper"
      @click="toggleDropdown"
    >
      <div class="sort-select-selected">
        <span class="sort-select-selected-value">{{ selectedLabel }}</span>
        <span
          class="sort-select-selected-icon"
          @click.stop="toggleOrder"
        >
          <span
            v-if="activeValue.order === 'desc'"
            class="ri-arrow-down-line"
          />
          <span
            v-else
            class="ri-arrow-up-line"
          />
        </span>
      </div>
    </div>

    <!-- 下拉菜单 -->
    <Teleport to="body">
      <server-sort-dropdown-menu
        ref="dropdownMenuRef"
        :visible="isDropdownOpen"
        :options="options"
        :active-value="activeValue.prop"
        :dropdown-style="dropdownStyle"
        :light-background="lightBackground"
        :is-mobile="isMobile"
        @select="handleSelectItem"
      />
    </Teleport>
  </div>
</template>

<script setup>
/**
 * 过滤栏
 */
import {
  computed,
  ref,
  onMounted,
  onUnmounted,
  nextTick,
} from 'vue';
import config from '@/config';
import ServerSortDropdownMenu from './server-sort-dropdown-menu.vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      prop: 'DisplayIndex',
      order: 'desc',
    }),
  },
  options: {
    type: Array,
    default: () => [],
  },
  acceptEmpty: {
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
  'change',
]);

const lightBackground = computed(() => config.nazhua.lightBackground);

// 设备检测（用于判断是否小屏，小屏时居中显示）
const isMobile = ref(window.innerWidth < 768);

// PC端下拉菜单相关
const isDropdownOpen = ref(false);
const triggerRef = ref(null);
const dropdownMenuRef = ref(null);
const dropdownStyle = ref({});

const activeValue = computed({
  get: () => props.modelValue,
  set: (val) => {
    emits('update:modelValue', val);
    emits('change', val);
  },
});

// 获取当前选中项的label
const selectedLabel = computed(() => {
  const selectedOption = props.options.find((opt) => opt.value === activeValue.value.prop);
  return selectedOption ? selectedOption.label : '排序';
});

// 更新下拉菜单位置
function updateDropdownPosition() {
  if (!triggerRef.value || !dropdownMenuRef.value) return;

  // 使用 nextTick 确保 DOM 已更新
  nextTick(() => {
    const dropdownRef = dropdownMenuRef.value?.dropdownRef;

    if (!dropdownRef) return;

    // 小屏设备：居中显示
    if (isMobile.value) {
      dropdownStyle.value = {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        visibility: 'visible',
      };
      return;
    }

    // 大屏设备：相对定位
    const triggerRect = triggerRef.value.getBoundingClientRect();

    // 先设置一个初始位置，确保元素在视口中可见
    let top = triggerRect.bottom + 8;
    let { left } = triggerRect;

    // 设置初始位置
    dropdownStyle.value = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      visibility: 'hidden', // 先隐藏，避免闪烁
    };

    // 再次使用 nextTick 确保样式已应用
    nextTick(() => {
      const dropdownRect = dropdownRef.getBoundingClientRect();

      // 防止超出右边界
      if (left + dropdownRect.width > window.innerWidth) {
        left = window.innerWidth - dropdownRect.width - 10;
      }

      // 防止超出下边界，如果超出则向上展开
      if (top + dropdownRect.height > window.innerHeight) {
        top = triggerRect.top - dropdownRect.height - 8;
      }

      // 防止超出左边界
      if (left < 10) {
        left = 10;
      }

      // 更新最终位置并显示
      dropdownStyle.value = {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        visibility: 'visible',
      };
    });
  });
}

// 切换下拉菜单显示状态
function toggleDropdown(event) {
  event.stopPropagation(); // 阻止事件冒泡，防止立即被 handleDocumentClick 关闭
  isDropdownOpen.value = !isDropdownOpen.value;
  if (isDropdownOpen.value) {
    nextTick(() => {
      updateDropdownPosition();
    });
  }
}

// 切换升序/降序
function toggleOrder(event) {
  event.stopPropagation(); // 阻止事件冒泡，避免触发下拉菜单
  if (!activeValue.value.prop) return; // 如果没有选中排序字段，则不切换

  activeValue.value = {
    prop: activeValue.value.prop,
    order: activeValue.value.order === 'desc' ? 'asc' : 'desc',
  };
  emits('change', activeValue.value);
}

// PC端选择项
function handleSelectItem(item) {
  if (activeValue.value.prop === item.value) {
    if (props.acceptEmpty) {
      activeValue.value = {
        prop: '',
        order: 'desc',
      };
    }
  } else {
    activeValue.value = {
      prop: item.value,
      order: activeValue.value.order || 'desc',
    };
  }
  isDropdownOpen.value = false;
  emits('change', activeValue.value);
}

// 点击外部关闭下拉菜单
function handleDocumentClick(event) {
  if (!isDropdownOpen.value) return;

  const dropdownRef = dropdownMenuRef.value?.dropdownRef;

  if (
    triggerRef.value
    && !triggerRef.value.contains(event.target)
    && dropdownRef
    && !dropdownRef.contains(event.target)
  ) {
    isDropdownOpen.value = false;
  }
}

// 窗口resize处理
function handleResize() {
  isMobile.value = window.innerWidth < 768;

  // 如果下拉菜单打开，更新位置
  if (isDropdownOpen.value) {
    nextTick(() => {
      updateDropdownPosition();
    });
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize);
  document.addEventListener('click', handleDocumentClick);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('click', handleDocumentClick);
});
</script>

<style lang="scss" scoped>
.server-sort-box {
  display: flex;
  flex-wrap: wrap;
  padding: 0 var(--list-padding);
  gap: 8px;
  position: relative;

  @media screen and (max-width: 768px) {
    &--mobile-hide {
      display: none;
    }
  }

  // PC端触发元素
  .sort-select-wrapper {
    position: relative;

    @media screen and (min-width: 768px) {
      cursor: pointer;
    }
  }

  .sort-select-selected {
    display: flex;
    align-items: center;
    height: 36px;
    padding: 0 15px;
    line-height: 1.2;
    border-radius: 6px;
    background: rgba(#000, 0.3);
    transition: all 0.3s linear;

    @media screen and (min-width: 768px) {
      cursor: pointer;
    }

    @media screen and (max-width: 768px) {
      height: 30px;
      padding: 0 10px;
      border-radius: 3px;
      background-color: rgba(#000, 0.8);
    }

    .sort-select-selected-value {
      color: #fff;
      font-weight: bold;
    }

    .sort-select-selected-icon {
      margin-left: 8px;
      color: #fff;
      display: flex;
      align-items: center;
      padding: 2px 4px;
      border-radius: 3px;
      transition: all 0.2s linear;

      @media screen and (min-width: 768px) {
        cursor: pointer;

        &:hover {
          background: rgba(#fff, 0.1);
        }

        &:active {
          background: rgba(#fff, 0.2);
        }
      }
    }
  }

  // PC端浅色背景样式
  &--light-background {
    .sort-select-selected {
      background: rgba(#000, 0.5);
    }
  }
}
</style>
