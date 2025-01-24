<template>
  <dot-dot-box
    class="server-head"
    padding="16px"
  >
    <div class="server-flag">
      <div class="server-flag-font">
        <span
          class="fi"
          :class="'fi-' + (info?.Host?.CountryCode || 'un')"
        />
      </div>
    </div>
    <div class="server-name-and-slogan">
      <div class="server-name-group">
        <span class="server-name">
          {{ info.Name }}
        </span>
        <span
          v-if="cpuAndMemAndDisk"
          class="cpu-mem-group"
        >
          <span
            class="system-os-icon"
          >
            <span :class="platformLogoIconClassName" />
          </span>
          <span class="core-mem">{{ cpuAndMemAndDisk }}</span>
        </span>
      </div>
      <div
        v-if="slogan"
        class="slogan-content"
      >
        <span>“{{ slogan }}”</span>
      </div>
      <div
        v-else-if="cpuInfo"
        class="cpu-model-info"
      >
        <span
          v-if="cpuInfo.company"
          class="cpu-company"
          :class="'cpu-company--' + cpuInfo.company.toLowerCase()"
        >
          {{ cpuInfo.company }}
        </span>
        <span
          v-if="cpuInfo.model"
          class="cpu-model"
        >
          {{ cpuInfo.model }}
        </span>
        <span
          v-if="cpuInfo.modelNum"
          class="cpu-model-num"
        >
          {{ cpuInfo.modelNum }}
        </span>
      </div>
    </div>
  </dot-dot-box>
</template>

<script setup>
/**
 * 单节点
 */
import {
  computed,
} from 'vue';
import * as hostUtils from '@/utils/host';
import handleServerInfo from '@/views/composable/server-info';

const props = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
});

/**
 * XCore XGB
 */
const { cpuAndMemAndDisk } = handleServerInfo({
  props,
});

const slogan = computed(() => props.info?.PublicNote?.customData?.slogan);
const cpuInfo = computed(() => hostUtils.getCPUInfo(props.info?.Host?.CPU?.[0]));
const platformLogoIconClassName = computed(() => hostUtils.getPlatformLogoIconClassName(props.info?.Host?.Platform));
</script>

<style lang="scss" scoped>
.server-head {
  display: flex;
  gap: 12px;
  transition: 0.3s;

  .server-flag {
    --flag-size: 72px;
    position: relative;
    width: calc(var(--flag-size) * 1.33333333);
    height: var(--flag-size);
    border-radius: 12px;
    overflow: hidden;

    .server-flag-font {
      position: absolute;
      top: 50%;
      left: 50%;
      width: calc(var(--flag-size) * 1.33333333);
      height: var(--flag-size);
      line-height: var(--flag-size);
      font-size: var(--flag-size);
      transform: translate(-50%, -50%);
    }

    @media screen and (max-width: 500px) {
      --flag-size: 40px;
      border-radius: 6px;
    }
  }

  .server-name-and-slogan {
    flex: 1;
    display: flex;
    flex-direction: column;
    // justify-content: space-between;
    gap: 4px;
    padding: 5px 0;

    @media screen and (max-width: 500px) {
      padding: 0;
    }
  }

  .server-name-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #eee;

    .server-name {
      line-height: 30px;
      font-size: 24px;
      font-weight: bold;
      color: #fff;
    }

    .system-os-icon {
      height: 24px;
      line-height: 22px;
      font-size: 20px;
    }

    .core-mem {
      line-height: 30px;
      font-size: 16px;
      font-weight: bold;
    }

    @media screen and (max-width: 500px) {
      display: block;

      .server-name {
        line-height: 24px;
        font-size: 16px;
      }
    }
  }

  .cpu-mem-group {
    display: flex;
    align-items: center;
    gap: 8px;
    @media screen and (max-width: 500px) {
      display: none;
    }
  }

  .slogan-content {
    color: #ccc;
    line-height: 18px;
    font-size: 14px;
    @media screen and (max-width: 500px) {
      line-height: 16px;
      font-size: 12px;
    }
  }

  .cpu-model-info {
    display: flex;
    align-items: center;
    gap: 6px;
    padding-left: 2px;
    line-height: 24px;
    color: #ddd;

    .cpu-company {
      height: 22px;
      line-height: 22px;
      padding: 0 5px;
      color: #111;
      background: #e0fcff;

      &--intel {
        text-transform: lowercase;
        color: #fff;
        background: #0068b5;
        font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
        font-weight: 600;
      }
      &--amd {
        font-weight: bold;
        font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
      }
    }

    .cpu-model {
      color: #e0fcff;
    }

    .cpu-model-num {
      color: #c7eeff;
    }

    @media screen and (max-width: 500px) {
      padding-left: 0;
      margin-top: -7px;
      line-height: 16px;
      .cpu-company {
        height: 16px;
        line-height: 16px;
        padding: 0 3px;
      }
    }
  }
}
</style>
