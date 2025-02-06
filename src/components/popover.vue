<template>
  <div
    ref="triggerRef"
    class="popover-trigger"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focusin="handleFocusIn"
    @focusout="handleFocusOut"
    @click="handleTriggerClick"
  >
    <slot name="trigger" />
  </div>

  <Teleport to="body">
    <div
      v-show="isShow"
      ref="popoverRef"
      class="popover"
      :style="[popoverStyle, { zIndex: currentZIndex }]"
    >
      <template v-if="$slots.title || title">
        <div class="popover-body">
          {{ title }}
        </div>
      </template>
      <template v-else>
        <div class="popover-body">
          <slot name="default" />
        </div>
      </template>
    </div>
  </Teleport>
</template>

<script setup>
/**
  组件名称：Popover

  组件说明：
  该组件在移动端与 PC 端提供不同的交互模式，通过 "hover" 或 "click" 来触发显示或隐藏提示浮层。
  若设置 unique 属性，则在显示新浮层的同时会隐藏其他已显示的浮层。

  使用示例：
  <Popover title="示例标题" trigger="click">
    <template #trigger>
      <button>点击触发</button>
    </template>
    这是 Popover 的内容
  </Popover>

  Props:
    - visible (Boolean，默认 false)
      Popover 的可见状态，可供外部进行手动控制。
    - title (String，默认 '')
      Popover 的标题文本，如不传则展示默认内容插槽。
    - trigger (String，默认 'hover')
      触发模式，可选值为 "hover" 或 "click"。
    - unique (Boolean，默认 true)
      如果为 true，则在显示当前 Popover 时会自动隐藏其他已显示的 Popover。

  方法说明：
    - handleMouseEnter()
      当鼠标移入触发元素时，若 trigger 为 hover，会显示 Popover。
    - handleMouseLeave()
      当鼠标移出触发元素时，若 trigger 为 hover，会隐藏 Popover。
    - handleTriggerClick(e)
      当在移动端或 trigger 为 click 时，点击触发元素会切换 Popover 显示状态，并在移动端下自动延时隐藏。
    - handleFocusIn()
      当触发元素获得焦点时，若触发方式为 hover，会显示 Popover。
    - handleFocusOut()
      当触发元素失去焦点时，若触发方式为 hover，会隐藏 Popover。

  注意事项：
    - 在移动端会根据窗口宽度做适配，通过 document 监听点击事件和窗口大小变化来控制显示与关闭。
    - 当 visible 通过外部控制时，非移动端能手动实现 Popover 的显隐。
 */
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch,
} from 'vue';
import { getNextZIndex } from '../utils/zIndexManager';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  trigger: {
    type: String,
    default: 'hover',
    validator: (value) => ['hover', 'click'].includes(value),
  },
  unique: {
    type: Boolean,
    default: true,
  },
});

// 移除全局 Symbol 相关代码
// 添加静态 z-index 计数器
// const baseZIndex = 1000;
// let zIndexCounter = baseZIndex;

const popoverRef = ref(null);
const position = ref({
  x: 0,
  y: 0,
});
const isMobile = ref(window.innerWidth < 600);
const isShow = ref(false);
const triggerRef = ref(null);
const currentZIndex = ref(1000);

// 移除 getCurrentPopover 和 setCurrentPopover 函数

// 更新移动端位置
const updateMobilePosition = () => {
  if (!triggerRef.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  position.value = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height,
  };
};

// 修改显示逻辑
const updateShow = (value) => {
  if (value) {
    currentZIndex.value = getNextZIndex();
  }
  isShow.value = value;
};

const handleMouseEnter = () => {
  if (!isMobile.value && props.trigger === 'hover') {
    updateShow(true);
  }
};

const handleMouseLeave = () => {
  if (!isMobile.value && props.trigger === 'hover') {
    updateShow(false);
  }
};

let autoCloseTimer;
const handleTriggerClick = (e) => {
  if (props.trigger === 'click' || isMobile.value) {
    e.stopPropagation();
    updateShow(!isShow.value);
    if (isShow.value && isMobile.value) {
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
      autoCloseTimer = setTimeout(() => {
        isShow.value = false;
      }, 5 * 1000);
      updateMobilePosition();
    }
  }
};

const handleFocusIn = () => {
  if (!isMobile.value && props.trigger === 'hover') {
    isShow.value = true;
  }
};

const handleFocusOut = () => {
  if (!isMobile.value && props.trigger === 'hover') {
    isShow.value = false;
  }
};

// 修改点击事件处理
const handleDocumentClick = (e) => {
  if (isShow.value && !triggerRef.value?.contains(e.target) && !popoverRef.value?.contains(e.target)) {
    isShow.value = false;
  }
};

const updatePosition = (e) => {
  if (isMobile.value || !isShow.value) return;
  position.value = {
    x: e.clientX,
    y: e.clientY,
  };
};

const popoverStyle = computed(() => {
  if (isMobile.value) {
    return {
      position: 'fixed',
      bottom: '10vh',
      left: '50%',
      transform: 'translateX(-50%)',
    };
  }

  const { x, y } = position.value;
  const rect = popoverRef.value?.getBoundingClientRect();
  const offset = 15; // 修改为20px偏移量

  let left = x + offset;
  let top = y + offset;

  if (rect) {
    // 防止超出右边界
    if (left + rect.width > window.innerWidth) {
      left = x - rect.width - offset;
    }
    // 防止超出下边界
    if (top + rect.height > window.innerHeight) {
      top = y - rect.height - offset;
    }
  }

  return {
    position: 'fixed',
    left: `${left}px`,
    top: `${top}px`,
  };
});

const handleResize = () => {
  isMobile.value = window.innerWidth < 600;
};

// 监听visible属性变化
watch(() => props.visible, (newVal) => {
  if (!isMobile.value) {
    updateShow(newVal);
  }
});

onMounted(() => {
  if (isMobile.value || props.trigger === 'click') {
    document.addEventListener('click', handleDocumentClick);
  }
  if (!isMobile.value) {
    document.addEventListener('mousemove', updatePosition);
  }
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (isMobile.value || props.trigger === 'click') {
    document.removeEventListener('click', handleDocumentClick);
  }
  if (!isMobile.value) {
    document.removeEventListener('mousemove', updatePosition);
  }
  window.removeEventListener('resize', handleResize);
  // 移除全局 Popover 相关的清理代码
});
</script>

<style lang="scss" scoped>
.popover-trigger {
  display: inline-block;
  cursor: pointer;
}

.popover {
  background: rgba(#000, 0.8);
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  // 移除固定的 z-index
  max-width: 300px;

  @media screen and (max-width: 600px) {
    max-width: 90%;
    text-align: center;
    box-shadow: 0 4px 12px rgba(251, 255, 217, 0.15);
  }

  .popover-body {
    line-height: 1.4;
    font-size: 14px;
    // 允许换行
    white-space: pre-wrap;
  }
}
</style>
