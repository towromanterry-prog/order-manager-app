<template>
  <div class="status-indicators" :style="containerStyle">
    <div v-if="stats.inProgress > 0" class="indicator in-progress" :style="indicatorStyle"></div>
    <div v-if="stats.completed > 0" class="indicator completed" :style="indicatorStyle"></div>
    <div v-if="stats.delivered > 0" class="indicator delivered" :style="indicatorStyle"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  stats: {
    type: Object,
    required: true,
    default: () => ({ inProgress: 0, completed: 0, delivered: 0 })
  },
  size: {
    type: Number,
    default: 6
  },
  bottom: {
    type: Number,
    default: 7
  },
  gap: {
    type: Number,
    default: 4
  }
});

const containerStyle = computed(() => ({
  bottom: `${props.bottom}px`,
  gap: `${props.gap}px`
}));

const indicatorStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`
}));
</script>

<style scoped>
.status-indicators {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}
.indicator {
  border-radius: 50%;
  border: 1px solid rgba(var(--v-theme-surface), 0.7);
  box-sizing: content-box;
}
.in-progress { background-color: #FB8C00; }
.completed { background-color: #1976D2; }
.delivered { background-color: #43A047; }
</style>