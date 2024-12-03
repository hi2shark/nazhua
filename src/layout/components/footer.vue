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
        Theme By <a
          ref="nofollow"
          class="nazhua"
          href="https://github.com/hi2shark/nazhua"
          target="_blank"
        >Nazhua</a>
        {{ version }}
      </span>
    </div>
  </div>
</template>

<script setup>
/**
 * Footer
 */

const version = import.meta.env.VITE_APP_VERSION;
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
