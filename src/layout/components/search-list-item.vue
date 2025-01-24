<template>
  <div
    class="search-list-item"
    @click="openDetail"
  >
    <div class="server-name">
      {{ info.Name }}
    </div>
    <div class="server-tag-list">
      <span
        v-for="(tagItem, index) in tagList"
        :key="`${tagItem}_${index}`"
        class="tag-item"
        :class="{
          'has-sarasa-term': $hasSarasaTerm && config.nazhua.disableSarasaTermSC !== true,
        }"
      >
        {{ tagItem }}
      </span>
    </div>
  </div>
</template>

<script setup>
/**
 * 搜索后的单条展示
 */

import {
  computed,
} from 'vue';

import config from '@/config';

const props = defineProps({
  info: {
    type: Object,
    required: true,
  },
});

const emits = defineEmits([
  'open-detail',
]);

const tagList = computed(() => {
  const list = [];
  const {
    networkRoute,
    extra,
  } = props?.info?.PublicNote?.planDataMod || {};
  if (networkRoute) {
    list.push(...networkRoute.split(','));
  }
  if (extra) {
    list.push(...extra.split(','));
  }
  // 列表最多显示3个标签
  return list.slice(0, 3);
});

function openDetail() {
  emits('open-detail', props.info);
}

</script>

<style lang="scss" scoped>
.search-list-item {
  cursor: pointer;
  display: flex;
  flex-wrap: wrap;
  padding: 8px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  .server-name {
    flex: 1;
    line-height: 30px;
    font-size: 16px;
    font-weight: bold;
  }

  .server-tag-list {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 30px;

    .tag-item {
      height: 18px;
      padding: 0 4px;
      line-height: 18px;
      font-size: 12px;
      color: var(--public-note-tag-color);
      background: var(--public-note-tag-bg);
      text-shadow: 1px 1px 2px rgba(#000, 0.2);
      border-radius: 4px;

      &.has-sarasa-term {
        line-height: 20px;
      }
    }
  }
}
</style>
