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
      const newScript = document.createElement('script');
      newScript.type = 'text/javascript';
      if (script.src) {
        newScript.src = script.src; // 拷贝外部脚本的 src
      } else {
        newScript.textContent = script.textContent; // 拷贝内联脚本
      }
      document.body.appendChild(newScript);
      document.body.removeChild(newScript); // 可选：移除以保持整洁
    });
  });
};

watch(dynamicContent, () => {
  if (dynamicContent.value) {
    executeScripts();
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
