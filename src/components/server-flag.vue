<template>
  <span
    class="server-flag"
  >
    <span
      class="fi"
      :class="'fi-' + lastFlag"
    />
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
});

const lastFlag = computed(() => {
  let flag = props.info?.Host?.CountryCode || 'un';
  if (props.info?.PublicNote?.customData?.flag) {
    flag = props.info.PublicNote.customData.flag;
  }
  return flag.toLowerCase();
});
</script>
