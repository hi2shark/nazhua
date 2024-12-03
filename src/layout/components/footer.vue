<template>
  <div class="layout-footer">
    <div class="copyright-text">
      <span class="text">
        Powered by
        <a
          ref="nofollow"
          href="https://nezha.wiki"
          target="_blank"
        >哪吒监控</a>
      </span>
      <span class="text">
        Theme By <span
          class="nazhua"
          title="公开版本还在搓，Coming Soon ~"
        >Nazhua</span>
        {{ version }}
      </span>
    </div>
  </div>
</template>

<script setup>
/**
 * Footer
 */

const version = import.meta.env.VITE_VERSION;
</script>

<style lang="scss" scoped>
.layout-footer {
  padding: 20px;
  font-size: 12px;
  color: #ccc;

  .copyright-text {
    display: flex;
    justify-content: center;
    gap: 1em;
  }

  .nazhua {
    color: #fa0;
    cursor: default;
  }

  a {
    color: #fff;
  }
}
</style>
