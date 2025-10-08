<template>
  <v-chip
    :color="statusInfo.color"
    :prepend-icon="statusInfo.icon"
    :variant="variant"
    size="small"
    label
    class="status-indicator"
    style="cursor: pointer;"
    @mousedown="startPress"
    @mouseup="endPress"
    @mouseleave="cancelPress"
    @touchstart.prevent="startPress"
    @touchend.prevent="endPress"
  >
    {{ statusInfo.text }}
  </v-chip>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useOrderStore } from '@/stores/orderStore';

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    default: 'tonal'
  }
});

const emit = defineEmits(['click', 'long-press']);

const orderStore = useOrderStore();
const pressTimer = ref(null);

const startPress = () => {
  pressTimer.value = setTimeout(() => {
    emit('long-press');
    pressTimer.value = null; // Mark that long press has fired
  }, 700); // 700ms for a long press
};

const endPress = (event) => {
  if (pressTimer.value) {
    clearTimeout(pressTimer.value);
    // It's a regular click because the timer was cleared before it fired.
    emit('click', event);
  }
};

const cancelPress = () => {
    if (pressTimer.value) {
        clearTimeout(pressTimer.value);
    }
}

const statusInfo = computed(() => {
  const text = orderStore.getStatusText(props.status);
  switch (props.status) {
    case 'accepted':
      return { text, color: 'primary', icon: 'mdi-inbox-arrow-down' };
    case 'additional':
      return { text, color: 'deep-purple-accent-2', icon: 'mdi-progress-question' };
    case 'in_progress':
      return { text, color: 'warning', icon: 'mdi-progress-wrench' };
    case 'completed':
      return { text, color: 'info', icon: 'mdi-progress-check' };
    case 'delivered':
      return { text, color: 'success', icon: 'mdi-check-decagram' };
    case 'cancelled':
      return { text, color: 'error', icon: 'mdi-cancel' };
    default:
      return { text: 'Неизвестно', color: 'grey', icon: 'mdi-help-circle' };
  }
});
</script>

<style scoped>
.status-indicator {
  min-width: 100px;
  justify-content: center;
  user-select: none; /* Prevent text selection during long press */
}
</style>