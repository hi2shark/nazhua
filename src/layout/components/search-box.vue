<template>
  <transition name="fadeIn">
    <div
      v-if="show"
      class="search-box-background"
      @click="closeSearchBox"
    />
  </transition>
  <transition name="fadeIn">
    <div
      v-if="show"
      class="search-box-group"
    >
      <div class="search-box">
        <input
          ref="searchInputRef"
          v-model.trim="searchWord"
          type="text"
          placeholder="可搜索服务器名称、标签、系统、国别代码"
          class="search-box-input"
          @input="onSearchInput"
          @keydown.enter="onSearchInput"
          @blur="onSearchInput"
        />
        <span
          v-if="searchWord"
          class="clear-btn"
          @click="clearSearchWord"
        >
          <i class="clear-icon ri-close-fill" />
        </span>
      </div>
      <div class="result-server-list-container">
        <div class="search-list">
          <search-list-item
            v-for="item in searchResult"
            :key="item.ID"
            :info="item"
            @open-detail="openDetail"
          />
        </div>
      </div>
    </div>
  </transition>

  <div
    class="search-active-btn"
    @click="activeSearchBox"
  >
    <span class="icon">
      <i class="ri-search-eye-line" />
    </span>
  </div>
</template>

<script setup>
/**
 * 搜索盒子
 */

import {
  computed,
  ref,
  onMounted,
  onUnmounted,
} from 'vue';
import {
  useStore,
} from 'vuex';
import {
  useRouter,
} from 'vue-router';

import SearchListItem from './search-list-item.vue';

const router = useRouter();
const store = useStore();
const serverList = computed(() => store.state.serverList);

const show = ref(false);
const searchWord = ref('');
const searchResult = ref([]);
const searchInputRef = ref(null);

let handleSearchTimer = null;
function handleSearch() {
  if (handleSearchTimer) {
    clearTimeout(handleSearchTimer);
  }
  if (!searchWord.value) {
    searchResult.value = [...serverList.value];
    return;
  }
  handleSearchTimer = setTimeout(() => {
    handleSearchTimer = null;
    searchResult.value = serverList.value.filter((item) => {
      {
        const matched = item.Name.toLowerCase().includes(searchWord.value.toLowerCase());
        if (matched) {
          return true;
        }
      }
      if (item?.PublicNote?.planDataMod) {
        const {
          networkRoute = '',
          extra = '',
        } = item.PublicNote.planDataMod;
        return [
          networkRoute.toLowerCase().includes(searchWord.value.toLowerCase()),
          extra.toLowerCase().includes(searchWord.value.toLowerCase()),
          (item.Host.Platform || '').toLowerCase().includes(searchWord.value.toLowerCase()),
          (item.Host.CountryCode || '').toLowerCase().includes(searchWord.value.toLowerCase()),
        ].some((match) => match);
      }
      return false;
    });
  }, 200);
}

function onSearchInput() {
  handleSearch();
}

function clearSearchWord() {
  searchWord.value = '';
  searchResult.value = [...serverList.value];
}

function activeSearchBox() {
  searchWord.value = '';
  searchResult.value = [...serverList.value];
  show.value = true;
  // 锁定页面滚动
  document.body.style.overflow = 'hidden';

  // 聚焦到搜索框
  setTimeout(() => {
    searchInputRef.value.focus();
  }, 30);
}

function closeSearchBox() {
  show.value = false;
  document.body.style.overflow = '';
}

function openDetail(info) {
  router.push({
    name: 'ServerDetail',
    params: {
      serverId: info.ID,
    },
  });
  closeSearchBox();
}

function handleKeyDown(event) {
  if (event.ctrlKey && event.key === 'k') {
    event.stopPropagation();
    event.preventDefault();
    if (show.value) {
      closeSearchBox();
    } else {
      activeSearchBox();
    }
  }
}

function handleEscKey(event) {
  if (!show.value) {
    return;
  }
  if (event.key === 'Escape') {
    closeSearchBox();
    event.stopPropagation();
    event.preventDefault();
  }
}

onMounted(() => {
  // 监听按下快捷键 Ctrl+K 打开搜索框
  window.addEventListener('keydown', handleKeyDown);
  // 监听按下 Esc 关闭搜索框
  window.addEventListener('keydown', handleEscKey);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keydown', handleEscKey);
});
</script>

<style lang="scss" scoped>
.search-box-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.search-box-group {
  position: fixed;
  left: 50%;
  top: 150px;
  z-index: 1010;
  transform: translate(-50%, 0);
  width: 600px;
  padding: 30px;
  border-radius: 12px;
  background-color: rgba(#000, 0.9);

  @media screen and (max-width: 640px) {
    width: auto;
    top: 100px;
    left: 20px;
    right: 20px;
    padding: 20px;
    transform: translate(0, 0);
  }

  .search-box {
    position: relative;
    width: 100%;
    padding-right: 40px;
    border-radius: 20px;
    background: #eee;

    .search-box-input {
      width: 100%;
      height: 40px;
      padding: 0 15px;
      color: #234;
      font-size: 14px;
      background: transparent;
      border: none;
      outline: none;
      transition: 0.3s;
    }

    .clear-btn {
      position: absolute;
      top: 0;
      right: 0;
      width: 40px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      cursor: pointer;
      transition: 0.3s;

      .clear-icon {
        font-size: 20px;
        color: #666;
      }

      &:hover {
        color: #333;
      }
    }
  }

  .search-list {
    margin-top: 10px;
    height: 300px;
    overflow-x: hidden;
    overflow-y: auto;
    @media screen and (max-width: 640px) {
      height: 50vh;
    }

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 4px;

      &:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    }
  }
}

.search-active-btn {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 10;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(#000, 0.7);
  cursor: pointer;
  transition: 0.3s;

  .icon {
    line-height: 1;
    font-size: 24px;
    color: #eee;
  }

  &:hover {
    background: rgba(#000, 0.9);
  }
}

.fadeIn-enter-active,
.fadeIn-leave-active {
  transition: opacity 0.3s ease-in-out;
}
.fadeIn-enter-from,
.fadeIn-leave-to {
  opacity: 0;
}
</style>
