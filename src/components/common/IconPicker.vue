<template>
  <v-dialog v-model="dialog" max-width="600">
    <template v-slot:activator="{ props }">
      <v-btn 
        v-bind="props"
        :prepend-icon="selectedIcon || 'mdi-image-plus'"
        variant="outlined"
        class="icon-picker-btn"
      >
        {{ selectedIcon ? 'Изменить иконку' : 'Выбрать иконку' }}
      </v-btn>
    </template>

    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon>mdi-palette</v-icon>
        <span class="ml-2">Выбор иконки</span>
        <v-spacer></v-spacer>
        <v-btn 
          icon="mdi-close" 
          variant="text" 
          @click="dialog = false"
        ></v-btn>
      </v-card-title>

      <v-card-text>
        <v-text-field
          v-model="searchQuery"
          prepend-icon="mdi-magnify"
          label="Поиск иконки..."
          variant="outlined"
          clearable
          hide-details
          class="mb-4"
        ></v-text-field>

        <div class="icons-grid">
          <div
            v-for="icon in filteredIcons"
            :key="icon.value"
            :class="['icon-item', { selected: selectedIcon === icon.value }]"
            @click="selectIcon(icon.value)"
          >
            <v-icon size="24">{{ icon.value }}</v-icon>
            <span class="icon-text">{{ icon.text }}</span>
          </div>
        </div>

        <v-divider class="my-4"></v-divider>
        
        <!-- Кастомная иконка -->
        <v-text-field
          v-model="customIcon"
          label="Или введите название иконки MDI"
          hint="Например: mdi-scissors, mdi-brush"
          variant="outlined"
          clearable
          @keyup.enter="selectIcon(customIcon)"
        >
          <template v-slot:append-inner>
            <v-icon 
              v-if="customIcon && customIcon.startsWith('mdi-')"
              :icon="customIcon"
              size="20"
            ></v-icon>
          </template>
        </v-text-field>
      </v-card-text>

      <v-card-actions>
        <v-btn 
          variant="text" 
          @click="selectIcon('')"
        >
          Убрать иконку
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn 
          variant="text" 
          @click="dialog = false"
        >
          Отмена
        </v-btn>
        <v-btn 
          color="primary" 
          @click="confirmSelection"
        >
          Выбрать
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

const dialog = ref(false);
const selectedIcon = ref(props.modelValue);
const searchQuery = ref('');
const customIcon = ref('');

// Популярные иконки для услуг
const popularIcons = [
  { value: 'mdi-content-cut', text: 'Ножницы (стрижка)' },
  { value: 'mdi-brush', text: 'Кисть (окрашивание)' },
  { value: 'mdi-hand-extended', text: 'Рука (маникюр)' },
  { value: 'mdi-foot-print', text: 'Стопа (педикюр)' },
  { value: 'mdi-face-woman', text: 'Косметология' },
  { value: 'mdi-spa', text: 'SPA процедуры' },
  { value: 'mdi-eyedropper', text: 'Инъекции' },
  { value: 'mdi-laser-pointer', text: 'Лазер' },
  { value: 'mdi-account-heart', text: 'Массаж' },
  { value: 'mdi-flower', text: 'Косметика' },
  { value: 'mdi-heart-pulse', text: 'Здоровье' },
  { value: 'mdi-crown', text: 'VIP услуги' },
  { value: 'mdi-diamond', text: 'Премиум' },
  { value: 'mdi-star', text: 'Рекомендуемое' },
  { value: 'mdi-clock', text: 'Быстрые услуги' },
  { value: 'mdi-home', text: 'На дому' }
];

const filteredIcons = computed(() => {
  if (!searchQuery.value) return popularIcons;
  
  const query = searchQuery.value.toLowerCase();
  return popularIcons.filter(icon => 
    icon.text.toLowerCase().includes(query) ||
    icon.value.toLowerCase().includes(query)
  );
});

const selectIcon = (iconValue) => {
  selectedIcon.value = iconValue;
};

const confirmSelection = () => {
  emit('update:modelValue', selectedIcon.value);
  dialog.value = false;
};

// Синхронизируем внешнее значение
watch(() => props.modelValue, (newValue) => {
  selectedIcon.value = newValue;
});
</script>

<style scoped>
.icon-picker-btn {
  width: 100%;
}

.icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 80px;
  justify-content: center;
}

.icon-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.1);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.icon-item.selected {
  background-color: rgba(var(--v-theme-primary), 0.2);
  border-color: var(--v-theme-primary);
}

.icon-text {
  font-size: 0.75rem;
  text-align: center;
  margin-top: 4px;
  line-height: 1.2;
}
</style>