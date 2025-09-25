<template>
  <div>
    <!-- Список уже добавленных услуг -->
    <div v-for="(service, index) in selectedServices" :key="index" class="service-item d-flex align-center mb-3">
      <!-- Иконка услуги -->
      <div class="service-icon-container mr-3">
        <v-icon v-if="service.icon" size="24" color="primary">{{ service.icon }}</v-icon>
        <v-icon v-else size="24" color="grey-lighten-1">mdi-help-circle-outline</v-icon>
      </div>
      
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
      <v-btn 
        icon="mdi-delete-outline" 
        variant="text" 
        color="grey" 
        @click="removeService(index)"
      ></v-btn>
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
      clearable
      hide-details="auto"
      @update:model-value="addService"
    >
      <template v-slot:item="{ props, item }">
        <v-list-item v-bind="props">
          <template v-slot:prepend>
            <v-avatar size="32" color="primary" v-if="item.raw.icon">
              <v-icon color="white" size="18">{{ item.raw.icon }}</v-icon>
            </v-avatar>
            <v-avatar size="32" color="grey-lighten-2" v-else>
              <v-icon color="grey" size="18">mdi-help-circle-outline</v-icon>
            </v-avatar>
          </template>
          
          <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ item.raw.defaultPrice }}₽
            <span v-if="item.raw.tags && item.raw.tags.length > 0" class="ml-2">
              <v-chip
                v-for="tagId in item.raw.tags.slice(0, 2)"
                :key="tagId"
                size="x-small"
                class="mr-1"
              >
                {{ getTagName(tagId) }}
              </v-chip>
            </span>
          </v-list-item-subtitle>
        </v-list-item>
      </template>

      <template v-slot:selection="{ item }">
        <div class="d-flex align-center">
          <v-icon v-if="item.raw.icon" class="mr-2" size="20">{{ item.raw.icon }}</v-icon>
          <span>{{ item.raw.name }}</span>
        </div>
      </template>
    </v-autocomplete>

    <!-- Быстрые действия -->
    <div class="mt-3 d-flex align-center" v-if="selectedServices.length > 0">
      <v-chip
        size="small"
        color="primary"
        variant="outlined"
        class="mr-2"
      >
        <v-icon size="16" class="mr-1">mdi-calculator</v-icon>
        Итого: {{ totalAmount }}₽
      </v-chip>
      
      <v-spacer></v-spacer>
      
      <v-btn
        size="small"
        variant="text"
        color="error"
        @click="clearAllServices"
      >
        <v-icon size="16" class="mr-1">mdi-delete-sweep</v-icon>
        Очистить всё
      </v-btn>
    </div>

    <!-- Популярные услуги (если список пустой) -->
    <div v-if="selectedServices.length === 0 && popularServices.length > 0" class="mt-4">
      <v-divider class="mb-3"></v-divider>
      <p class="text-body-2 text-medium-emphasis mb-3">Популярные услуги:</p>
      <div class="d-flex flex-wrap gap-2">
        <v-chip
          v-for="service in popularServices"
          :key="service.id"
          size="small"
          variant="outlined"
          clickable
          @click="quickAddService(service)"
        >
          <v-icon v-if="service.icon" size="16" class="mr-1">{{ service.icon }}</v-icon>
          {{ service.name }}
          <span class="ml-1 text-caption">({{ service.defaultPrice }}₽)</span>
        </v-chip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useServiceStore } from '@/stores/serviceStore';
import { useTagsStore } from '@/stores/tagsStore';

const serviceStore = useServiceStore();
const tagsStore = useTagsStore();

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue']);

// Локальное состояние
const serviceToAdd = ref(null);
const selectedServices = ref([...props.modelValue]);

// Computed
const availableServices = computed(() => {
  const selectedIds = selectedServices.value.map(s => s.id);
  return serviceStore.services.filter(s => !selectedIds.includes(s.id));
});

const totalAmount = computed(() => {
  return selectedServices.value.reduce((sum, service) => sum + (service.price || 0), 0);
});

const popularServices = computed(() => {
  // Показываем топ-4 услуги по умолчанию
  return serviceStore.services.slice(0, 4);
});

// Методы
const addService = (service) => {
  if (service) {
    const serviceToAddToList = {
      id: service.id,
      name: service.name,
      price: service.defaultPrice,
      status: 'in_progress',
      icon: service.icon || ''
    };
    selectedServices.value.push(serviceToAddToList);
    serviceToAdd.value = null;
    updateParent();
  }
};

const quickAddService = (service) => {
  addService(service);
};

const removeService = (index) => {
  selectedServices.value.splice(index, 1);
  updateParent();
};

const clearAllServices = () => {
  selectedServices.value = [];
  updateParent();
};

const updateParent = () => {
  emit('update:modelValue', [...selectedServices.value]);
};

const getTagName = (tagId) => {
  const tag = tagsStore.tags?.find(t => t.id === tagId);
  return tag ? tag.name : '';
};

// Watchers
watch(() => props.modelValue, (newValue) => {
  selectedServices.value = [...newValue];
}, { deep: true });

onMounted(() => {
  // Загружаем теги если нужно
  if (tagsStore.tags.length === 0) {
    tagsStore.loadTags();
  }
});
</script>

<style scoped>
.service-item {
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.service-icon-container {
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.price-field {
  max-width: 120px;
}

@media (max-width: 768px) {
  .service-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .service-item .v-text-field {
    margin-bottom: 8px;
    margin-right: 0 !important;
  }
  
  .price-field {
    max-width: none;
  }
  
  .service-icon-container {
    align-self: flex-start;
    margin-bottom: 8px;
  }
}
</style>