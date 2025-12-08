<template>
  <dot-dot-box
    v-if="tableData"
    class="server-status"
  >
    <table class="server-status-table">
      <thead class="server-status-table-header">
        <tr class="server-status-table-header-row">
          <template
            v-for="column in tableData.columnProps"
            :key="`th_${column.prop}`"
          >
            <template v-if="['billing', 'remainingTime'].includes(column.prop)">
              <server-status-th
                v-if="tableData.showBilling && column.prop === 'billing'"
                :column="column"
              />
              <server-status-th
                v-if="tableData.showRemainingTime && column.prop === 'remainingTime'"
                :column="column"
              />
            </template>
            <template v-else>
              <server-status-th
                :column="column"
              />
            </template>
          </template>
        </tr>
      </thead>
      <tbody class="server-status-table-body">
        <tr
          v-for="itemData in tableData.list"
          :key="itemData.info.ID"
          class="server-status-table-body-row"
          :class="{
            'server-status-table-body-row--offline': itemData.info?.Online === -1,
            'server-status-table-body-row--online': itemData.info?.Online === 1,
            [`server-item--${itemData.info?.ID}`]: true,
          }"
        >
          <template
            v-for="column in itemData.columnData"
            :key="`td_${itemData.info?.ID}_${column.prop}`"
          >
            <template v-if="['billing', 'remainingTime'].includes(column.prop)">
              <server-status-td
                v-if="tableData.showBilling && column.prop === 'billing'"
                :column="column"
              />
              <server-status-td
                v-if="tableData.showRemainingTime && column.prop === 'remainingTime'"
                :column="column"
              />
            </template>
            <template v-else>
              <server-status-td
                :column="column"
              />
            </template>
          </template>
        </tr>
      </tbody>
    </table>
  </dot-dot-box>
</template>

<script setup>
/**
 * ServerStatus风格的列表
 */

import {
  computed,
} from 'vue';

import config from '@/config';

import {
  handleServerListColumn,
} from './server-status';

import ServerStatusTh from './table/th.vue';
import ServerStatusTd from './table/td.vue';

const props = defineProps({
  serverList: {
    type: Array,
    default: () => [],
  },
});

const tableData = computed(() => {
  const result = handleServerListColumn(props.serverList, config.nazhua.serverStatusColumnsTpl);
  return result;
});

</script>

<style lang="scss" scoped>
.server-status {
  --server-status-cell-padding: 0 5px;
  --server-status-td-height: 32px;

  --progress-bar-height: 18px;

  @media screen and (max-width: 350px) {
    --progress-bar-height: 16px;
    padding: 0 15px;
  }
}
.server-status-table {
  width: 100%;
  border-collapse: collapse;

  .server-status-table-body-row {
    &--offline {
      filter: grayscale(1);
    }
  }
}
</style>
