<template>
  <div
    class="nezha-user-info-group"
  >
    <a
      :href="dashboardUrl"
      class="dashboard-url"
      :title="userLogin ? $t('toDashboard') : $t('loginDashboard')"
      target="_blank"
    >
      <span
        :class="{
          'ri-dashboard-3-line': userLogin,
          'ri-user-line': !userLogin,
        }"
      />
      <span>{{ userLogin ? $t('dashboard') : $t('login') }}</span>
    </a>
  </div>
</template>

<script setup>
/**
 * 控制台入口
 */
import {
  computed,
} from 'vue';
import {
  useStore,
} from 'vuex';

import config from '@/config';

const store = useStore();

const userLogin = computed(() => store.state.profile?.username);
const dashboardUrl = computed(() => config.nazhua.v1DashboardUrl || '/dashboard');
</script>

<style lang="scss" scoped>
.nezha-user-info-group {
  display: flex;
  align-items: center;
  gap: 0 20px;

  .dashboard-url {
    display: flex;
    align-items: center;
    gap: 0 5px;
    color: #ddd;
    cursor: pointer;

    &:hover {
      color: #ff9a00;
    }
  }
}
</style>
