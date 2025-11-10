<template>
  <div class="layout-footer">
    <div
      v-if="footerSlogan"
      class="footer-slogan"
    >
      <div v-html="footerSlogan" />
    </div>
    <div class="copyright-text">
      <span class="text">
        Powered by
        <a
          ref="nofollow"
          href="https://nezha.wiki"
          :title="'当前为哪吒监控' + $config.nazhua.nezhaVersion"
          target="_blank"
        >哪吒监控</a>
      </span>
      <span class="text">
        Theme By <a
          ref="nofollow"
          class="nazhua"
          href="https://github.com/hi2shark/nazhua"
          target="_blank"
        >Nazhua</a>
        {{ version }}
      </span>
    </div>
    <div
      ref="dynamicContentRef"
      v-html="dynamicContent"
    />
  </div>
</template>

<script setup>
/**
 * Footer
 */

import {
  ref,
  computed,
  watch,
  onMounted,
  nextTick,
} from 'vue';
import { useStore } from 'vuex';
import config from '@/config';

const version = import.meta.env.VITE_APP_VERSION;
const store = useStore();

const footerSlogan = computed(() => decodeURIComponent(config.nazhua?.footerSlogan || ''));

const dynamicContentRef = ref();
const executedScripts = ref(new Set()); // 记录已执行的脚本，避免重复执行

const dynamicContent = computed(() => {
  if (store.state.setting?.config?.custom_code) {
    return store.state.setting.config.custom_code;
  }
  if (store.state.setting?.custom_code) {
    return store.state.setting.custom_code;
  }
  return '';
});

// 执行动态脚本的方法
const executeScripts = () => {
  nextTick(() => {
    if (!dynamicContentRef.value) return;

    const scripts = dynamicContentRef.value.querySelectorAll('script');

    scripts.forEach((script) => {
      try {
        // 生成脚本唯一标识，避免重复执行
        const scriptIdentifier = script.src || script.textContent || '';
        if (!scriptIdentifier || executedScripts.value.has(scriptIdentifier)) {
          return;
        }

        const newScript = document.createElement('script');
        newScript.type = script.type || 'text/javascript';

        // 复制所有相关属性
        if (script.async !== undefined) newScript.async = script.async;
        if (script.defer !== undefined) newScript.defer = script.defer;
        if (script.crossOrigin) newScript.crossOrigin = script.crossOrigin;
        if (script.integrity) newScript.integrity = script.integrity;
        if (script.noModule !== undefined) newScript.noModule = script.noModule;
        if (script.referrerPolicy) newScript.referrerPolicy = script.referrerPolicy;

        if (script.src) {
          // 外部脚本：监听加载完成事件
          newScript.src = script.src;
          newScript.onload = () => {
            executedScripts.value.add(scriptIdentifier);
          };
          newScript.onerror = (error) => {
            console.error('Failed to load external script:', script.src, error);
          };
          document.body.appendChild(newScript);
        } else {
          // 内联脚本：直接执行
          newScript.textContent = script.textContent;
          document.body.appendChild(newScript);
          executedScripts.value.add(scriptIdentifier);
          // 内联脚本执行后可以安全移除
          document.body.removeChild(newScript);
        }
      } catch (error) {
        console.error('Error executing dynamic script:', error);
      }
    });
  });
};

// 清理已执行脚本的记录（当内容变化时）
const cleanupScripts = () => {
  executedScripts.value.clear();
};

watch(dynamicContent, (newVal, oldVal) => {
  // 内容变化时，清理旧的执行记录
  if (newVal !== oldVal) {
    cleanupScripts();
  }

  if (newVal) {
    // 确保 DOM 已更新
    nextTick(() => {
      executeScripts();
    });
  }
});

onMounted(() => {
  if (dynamicContent.value) {
    executeScripts();
  }
});
</script>

<style lang="scss" scoped>
.layout-footer {
  padding: 20px;
  font-size: 12px;
  color: #ccc;

  .footer-slogan {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 5px;

    font-size: 14px;
    color: #fff;
  }

  .copyright-text {
    display: flex;
    justify-content: center;
    gap: 1em;
  }

  .nazhua {
    color: #fa0;
    &:hover {
      color: #fff;
    }
  }

  a {
    color: #fff;
    &:hover {
      color: #08f;
    }
  }
}
</style>
