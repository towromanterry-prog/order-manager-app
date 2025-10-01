<template>
  <v-chip
    :color="statusInfo.color"
    :prepend-icon="statusInfo.icon"
    :variant="variant"
    size="small"
    label
    class="status-indicator"
    style="cursor: pointer;"
  >
    {{ statusInfo.text }}
  </v-chip>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    required: true,
    // in_progress, completed, delivered, cancelled
  },
  variant: {
    type: String,
    default: 'tonal' // 'tonal', 'flat', 'elevated', 'outlined', 'plain', 'text'
  }
});

const statusInfo = computed(() => {
  switch (props.status) {
    case 'in_progress':
      return { text: 'В работе', color: 'warning', icon: 'mdi-progress-wrench' };
    case 'completed':
      return { text: 'Выполнен', color: 'info', icon: 'mdi-progress-check' };
    case 'delivered':
      return { text: 'Сдан', color: 'success', icon: 'mdi-check-decagram' };
    case 'cancelled':
      return { text: 'Отменен', color: 'error', icon: 'mdi-cancel' };
    default:
      return { text: 'Неизвестно', color: 'grey', icon: 'mdi-help-circle' };
  }
});
</script>

<style scoped>
.status-indicator {
  min-width: 100px;
  justify-content: center;
}
</style>