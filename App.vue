<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
