<template>
  <dot-dot-box
    class="server-head"
    :class="{
      'server-head--has-globe': showGlobe,
    }"
    padding="20px 22px"
  >
    <div class="server-main">
      <div class="server-flag-box">
        <server-flag :info="info" />
      </div>
      <div class="server-name-and-slogan">
        <div class="server-name-row">
          <span class="server-name">
            {{ info.Name }}
          </span>
        </div>
        <div
          v-if="slogan"
          class="slogan-content"
        >
          <span>“{{ slogan }}”</span>
        </div>
        <div
          v-else-if="cpuAndMemAndDisk || hasCpuInfo"
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
          <span
            v-if="cpuAndMemAndDisk"
            class="server-spec"
          >
            <span class="system-os-icon">
              <span :class="platformLogoIconClassName" />
            </span>
            <span>{{ cpuAndMemAndDisk }}</span>
          </span>
        </div>
      </div>
    </div>
    <div
      v-if="showGlobe"
      class="server-globe-box"
    >
      <server-globe
        :location="location"
      />
    </div>
  </dot-dot-box>
</template>

<script setup>
/**
 * 单节点
 */
import {
  computed,
  defineAsyncComponent,
  h,
} from 'vue';
import * as hostUtils from '@/utils/host';
import handleServerInfo from '@/views/composable/server-info';
import config from '@/config';

const ServerGlobePlaceholder = {
  render: () => h('div', { class: 'server-globe-placeholder' }),
};

const ServerGlobe = defineAsyncComponent({
  loader: () => import('@/components/server-detail/server-globe.vue'),
  loadingComponent: ServerGlobePlaceholder,
  delay: 0,
});

const props = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
  location: {
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
const hasCpuInfo = computed(() => !!(
  cpuInfo.value?.company
  || cpuInfo.value?.model
  || cpuInfo.value?.modelNum
));
const platformLogoIconClassName = computed(() => hostUtils.getPlatformLogoIconClassName(props.info?.Host?.Platform));
const showGlobe = computed(() => !config.nazhua?.hideDetailServerGlobe);
</script>

<style lang="scss" scoped>
.server-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: center;
  transition: 0.3s;

  &--has-globe {
    min-height: 178px;
  }

  .server-main {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .server-globe-placeholder {
    width: 170px;
    height: 170px;
    flex-shrink: 0;
    border-radius: 50%;
    border: 1px solid rgba(203, 241, 245, 0.08);
    background: radial-gradient(
      circle at 35% 35%,
      rgba(0, 212, 255, 0.16),
      rgba(203, 241, 245, 0.02) 62%,
      rgba(255, 255, 255, 0.02)
    );
  }

  .server-globe-box {
    display: flex;
    align-items: center;
    justify-content: center;
    justify-self: end;
    flex-shrink: 0;
  }

  .server-flag-box {
    --flag-size: 72px;
    position: relative;
    width: calc(var(--flag-size) * 1.33333333);
    height: var(--flag-size);
    border-radius: 12px;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.24);

    .server-flag {
      position: absolute;
      top: 50%;
      left: 50%;
      width: calc(var(--flag-size) * 1.33333333);
      height: var(--flag-size);
      line-height: var(--flag-size);
      font-size: var(--flag-size);
      transform: translate(-50%, -50%);
    }
  }

  .server-name-and-slogan {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
    min-width: 0;
  }

  .server-name-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px 12px;
  }

  .server-name {
    min-width: 0;
    line-height: 1.2;
    font-size: 28px;
    font-weight: bold;
    color: #fff;
    word-break: break-word;
  }

  .server-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 100%;
    min-height: 30px;
    padding: 5px 10px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    background: rgba(12, 16, 22, 0.55);
    color: #c9d4db;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
      background: rgba(18, 24, 32, 0.7);
    }

    &__icon {
      flex-shrink: 0;
      width: 22px;
      height: 22px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 14px;
      color: #8fdfff;
      background: rgba(143, 223, 255, 0.1);
    }

    &__text,
    &__suffix {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__text {
      font-size: 13px;
      font-weight: 600;
      color: #eef8ff;
    }

    &__suffix {
      font-size: 12px;
      color: #9fc7d6;
    }
  }

  .server-pill--spec {
    background: rgba(25, 40, 55, 0.6);
    border-color: rgba(143, 223, 255, 0.18);

    .server-pill__text {
      color: #fff;
    }
  }

  .server-spec {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 24px;
    color: #d7e4eb;
    font-size: 14px;

    .system-os-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      line-height: 16px;
      font-size: 14px;
      color: #8fdfff;
    }
  }

  .slogan-content {
    max-width: 720px;
    color: #c9d4db;
    line-height: 1.5;
    font-size: 14px;
  }

  .cpu-model-info {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px 8px;
    line-height: 1;
    color: #d7e4eb;

    .cpu-company {
      height: 22px;
      line-height: 22px;
      padding: 0 5px;
      color: #111;
      background: #e0fcff;
      border-radius: 4px;

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

      &--apple {
        font-weight: 600;
        font-family: PingFang SC, Arial, "Helvetica Neue", Helvetica, sans-serif;
        border-radius: 3px;
      }
    }

    .cpu-model,
    .cpu-model-num {
      height: 22px;
      line-height: 22px;
    }

    .cpu-model {
      color: #e0fcff;
    }

    .cpu-model-num {
      color: #8fdfff;
      font-weight: 600;
    }
  }

  @media screen and (max-width: 900px) {
    gap: 20px;

    &--has-globe {
      min-height: 160px;
    }

    .server-name {
      font-size: 24px;
    }

    .server-globe-placeholder {
      width: 144px;
      height: 144px;
    }
  }

  @media screen and (max-width: 680px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;

    &--has-globe {
      min-height: auto;
    }

    .server-globe-box {
      justify-self: end;
    }
  }

  @media screen and (max-width: 500px) {
    gap: 12px;

    .server-main {
      align-items: flex-start;
      gap: 12px;
    }

    .server-flag-box {
      --flag-size: 48px;
      border-radius: 8px;
    }

    .server-name-and-slogan {
      gap: 8px;
    }

    .server-name {
      line-height: 1.25;
      font-size: 18px;
    }

    .server-pill {
      min-height: 26px;
      padding: 4px 8px;
      gap: 5px;

      &__icon {
        width: 18px;
        height: 18px;
        font-size: 12px;
      }

      &__text {
        font-size: 12px;
      }

      &__suffix {
        font-size: 11px;
      }
    }

    .slogan-content {
      line-height: 1.45;
      font-size: 12px;
    }

    .cpu-model-info {
      padding-left: 0;
      font-size: 12px;

      .cpu-company {
        height: 18px;
        line-height: 18px;
        padding: 0 4px;
      }
    }

    .server-globe-placeholder {
      width: 110px;
      height: 110px;
    }
  }
}
</style>
