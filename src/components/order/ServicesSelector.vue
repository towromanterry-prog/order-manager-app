<template>
  <div>
    <!-- Список уже добавленных услуг -->
    <div v-for="(service, index) in selectedServices" :key="index" class="service-item d-flex align-center mb-3">
      <v-text-field
        v-model="service.name"
        label="Название услуги"
        class="mr-2"
        readonly
        variant="filled"
        density="compact"
        hide-details
      ></v-text-field>
      <v-text-field
        v-model.number="service.price"
        label="Цена"
        type="number"
        class="price-field"
        variant="filled"
        density="compact"
        prefix="₽"
        hide-details
      ></v-text-field>
      <v-btn icon="mdi-delete-outline" variant="text" color="grey" @click="removeService(index)"></v-btn>
    </div>

    <!-- Поле для добавления новой услуги -->
    <v-autocomplete
      v-model="serviceToAdd"
      :items="availableServices"
      item-title="name"
      item-value="id"
      label="Добавить услугу..."
      variant="filled"
      return-object
      hide-details
      @update:model-value="addService"
    >
      <template v-slot:no-data>
        <v-list-item>
          <v-list-item-title>
            Услуга не найдена.
          </v-list-item-title>
        </v-list-item>
      </template>
    </v-autocomplete>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useServiceStore } from '@/stores/serviceStore.js';
import { storeToRefs } from 'pinia';

const props = defineProps({
  modelValue: { type: Array, default: () => [] }
});

const emit = defineEmits(['update:modelValue']);

const serviceStore = useServiceStore();
const { services: availableServices } = storeToRefs(serviceStore);

const serviceToAdd = ref(null);

const selectedServices = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const addService = (selectedItem) => {
  if (!selectedItem) return;

  const newService = {
    id: selectedItem.id,
    name: selectedItem.name,
    price: selectedItem.defaultPrice
  };

  selectedServices.value.push(newService);
  
  setTimeout(() => {
    serviceToAdd.value = null;
  }, 0);
};

const removeService = (index) => {
  selectedServices.value.splice(index, 1);
};
</script>

<style scoped>
.price-field {
  max-width: 140px;
}
</style>