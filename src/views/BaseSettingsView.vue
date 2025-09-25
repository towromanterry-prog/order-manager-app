<template>
  <div>
    <!-- Компактный заголовок -->
    <v-app-bar color="surface" flat height="56">
      <template #prepend>
        <div class="d-flex align-center ml-1">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            @click="$router.go(-1)"
          />
          <span class="text-h6 font-weight-medium ml-3">Услуги и теги</span>
        </div>
      </template>

      <template #append>
        <div class="mr-1">
          <v-text-field
            v-model="searchQuery"
            placeholder="Поиск"
            rounded
            hide-details
            clearable
            height="36"
            density="compact"
            style="max-width: 200px; min-width: 140px;"
            class="flex-shrink-1"
          />
        </div>
      </template>
    </v-app-bar>

    <!-- Контейнер настроек -->
    <div class="settings-content">
      <!-- Кастомные div табы БЕЗ закруглений -->
      <v-card flat class="mb-0 no-rounded">
        <div class="custom-tabs-container">
          <div class="custom-tabs-wrapper">
            <div 
              :class="['custom-tab', { active: tab === 'services' }]" 
              @click="tab = 'services'"
            >
              Услуги
            </div>
            <div 
              :class="['custom-tab', { active: tab === 'tags' }]" 
              @click="tab = 'tags'"
            >
              Теги
            </div>
          </div>
          <!-- Кастомный слайдер -->
          <div 
            class="custom-slider" 
            :style="{ transform: `translateX(${tab === 'services' ? '0' : '100%'})` }"
          ></div>
        </div>
      </v-card>

      <!-- Контент вкладок -->
      <v-window v-model="tab">
        <!-- Вкладка услуг -->
        <v-window-item value="services">
          <v-card flat>
            <!-- Заголовок секции с кнопкой добавления -->
            <div class="d-flex align-center px-0 py-3">
              <h3 class="text-h6">Управление услугами</h3>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="openServiceDialog">
                <v-icon class="mr-2">mdi-plus</v-icon>
                Добавить услугу
              </v-btn>
            </div>
            <v-divider color="primary"></v-divider>

            <!-- Список услуг -->
            <v-list lines="two">
              <v-list-item
                v-for="service in filteredServices"
                :key="service.id"
                :title="service.name"
                :subtitle="`${service.defaultPrice}₽`"
              >
                <template v-slot:prepend v-if="service.icon">
                  <v-avatar color="primary" size="40">
                    <v-icon color="white">{{ service.icon }}</v-icon>
                  </v-avatar>
                </template>
                <template v-slot:prepend v-else>
                  <v-avatar color="grey-lighten-2" size="40">
                    <v-icon color="grey">mdi-help</v-icon>
                  </v-avatar>
                </template>
                
                <template v-slot:append>
                  <div class="d-flex align-center">
                    <!-- Теги -->
                    <div class="tags-container mr-3">
                      <v-chip
                        v-for="tagId in service.tags"
                        :key="tagId"
                        size="small"
                        class="mr-1"
                      >
                        {{ getTagName(tagId) }}
                      </v-chip>
                    </div>
                    
                    <!-- Кнопки действий -->
                    <v-btn
                      icon="mdi-pencil"
                      variant="text"
                      size="small"
                      @click="editService(service)"
                    ></v-btn>
                    <v-btn
                      icon="mdi-delete"
                      variant="text"
                      size="small"
                      color="error"
                      @click="deleteService(service.id)"
                    ></v-btn>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-window-item>

        <!-- Вкладка тегов -->
        <v-window-item value="tags">
          <v-card flat>
            <!-- Заголовок секции тегов -->
            <div class="d-flex align-center px-0 py-3">
              <h3 class="text-h6">Управление тегами</h3>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="openTagDialog">
                <v-icon class="mr-2">mdi-plus</v-icon>
                Добавить тег
              </v-btn>
            </div>
            <v-divider color="primary"></v-divider>

            <!-- Список тегов -->
            <v-list>
              <v-list-item
                v-for="tag in filteredTags"
                :key="tag.id"
                :title="tag.name"
              >
                <template v-slot:prepend>
                  <v-chip 
                    :color="tag.color" 
                    size="small"
                    class="mr-3"
                  >
                    {{ tag.name }}
                  </v-chip>
                </template>
                
                <template v-slot:append>
                  <v-btn
                    icon="mdi-pencil"
                    variant="text"
                    size="small"
                    @click="editTag(tag)"
                  ></v-btn>
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    size="small"
                    color="error"
                    @click="deleteTag(tag.id)"
                  ></v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-window-item>
      </v-window>
    </div>

    <!-- Диалог добавления/редактирования услуги -->
    <v-dialog v-model="serviceDialog" max-width="500">
      <v-card>
        <v-card-title>
          {{ editingService ? 'Редактировать услугу' : 'Добавить услугу' }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="serviceForm">
            <v-text-field
              v-model="serviceForm.name"
              label="Название услуги"
              :rules="[v => !!v || 'Название обязательно']"
              variant="outlined"
            ></v-text-field>
            
            <v-text-field
              v-model.number="serviceForm.defaultPrice"
              label="Цена по умолчанию"
              type="number"
              prefix="₽"
              :rules="[v => v > 0 || 'Цена должна быть больше 0']"
              variant="outlined"
            ></v-text-field>

            <!-- Выбор иконки -->
            <IconPicker v-model="serviceForm.icon" class="mb-4" />
            
            <!-- Выбор тегов -->
            <v-select
              v-model="serviceForm.tags"
              :items="availableTags"
              item-title="name"
              item-value="id"
              label="Теги"
              multiple
              chips
              variant="outlined"
            ></v-select>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="serviceDialog = false">Отмена</v-btn>
          <v-btn color="primary" @click="saveService">
            {{ editingService ? 'Сохранить' : 'Добавить' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог добавления/редактирования тега -->
    <v-dialog v-model="tagDialog" max-width="400">
      <v-card>
        <v-card-title>
          {{ editingTag ? 'Редактировать тег' : 'Добавить тег' }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="tagForm">
            <v-text-field
              v-model="tagForm.name"
              label="Название тега"
              :rules="[v => !!v || 'Название обязательно']"
              variant="outlined"
            ></v-text-field>
            
            <v-select
              v-model="tagForm.color"
              :items="tagColors"
              label="Цвет тега"
              variant="outlined"
            >
              <template v-slot:selection="{ item }">
                <v-chip :color="item.value" size="small">
                  {{ item.title }}
                </v-chip>
              </template>
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <v-chip :color="item.value" size="small">
                      {{ item.title }}
                    </v-chip>
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="tagDialog = false">Отмена</v-btn>
          <v-btn color="primary" @click="saveTag">
            {{ editingTag ? 'Сохранить' : 'Добавить' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useServiceStore } from '@/stores/serviceStore';
import { useTagsStore } from '@/stores/tagsStore';
import { useConfirmationStore } from '@/stores/confirmationStore';
import IconPicker from '@/components/common/IconPicker.vue';

const serviceStore = useServiceStore();
const tagsStore = useTagsStore();
const confirmationStore = useConfirmationStore();

// Поиск и фильтрация
const searchQuery = ref('');
const tab = ref('services');

// Диалоги
const serviceDialog = ref(false);
const tagDialog = ref(false);

// Формы
const serviceForm = ref({
  name: '',
  defaultPrice: 0,
  tags: [],
  icon: ''
});

const tagForm = ref({
  name: '',
  color: 'blue'
});

// Состояние редактирования
const editingService = ref(null);
const editingTag = ref(null);

// Цвета для тегов
const tagColors = [
  { title: 'Синий', value: 'blue' },
  { title: 'Зеленый', value: 'green' },
  { title: 'Красный', value: 'red' },
  { title: 'Оранжевый', value: 'orange' },
  { title: 'Фиолетовый', value: 'purple' },
  { title: 'Розовый', value: 'pink' },
  { title: 'Серый', value: 'grey' }
];

// Computed
const filteredServices = computed(() => {
  if (!searchQuery.value) return serviceStore.services;
  
  const query = searchQuery.value.toLowerCase();
  return serviceStore.services.filter(service =>
    service.name.toLowerCase().includes(query)
  );
});

const filteredTags = computed(() => {
  if (!searchQuery.value) return tagsStore.tags;
  
  const query = searchQuery.value.toLowerCase();
  return tagsStore.tags.filter(tag =>
    tag.name.toLowerCase().includes(query)
  );
});

const availableTags = computed(() => tagsStore.tags);

// Методы
const getTagName = (tagId) => {
  const tag = tagsStore.tags.find(t => t.id === tagId);
  return tag ? tag.name : 'Неизвестный тег';
};

const openServiceDialog = () => {
  editingService.value = null;
  serviceForm.value = {
    name: '',
    defaultPrice: 0,
    tags: [],
    icon: ''
  };
  serviceDialog.value = true;
};

const openTagDialog = () => {
  editingTag.value = null;
  tagForm.value = {
    name: '',
    color: 'blue'
  };
  tagDialog.value = true;
};

const editService = (service) => {
  editingService.value = service;
  serviceForm.value = {
    name: service.name,
    defaultPrice: service.defaultPrice,
    tags: [...service.tags],
    icon: service.icon || ''
  };
  serviceDialog.value = true;
};

const editTag = (tag) => {
  editingTag.value = tag;
  tagForm.value = {
    name: tag.name,
    color: tag.color
  };
  tagDialog.value = true;
};

const saveService = async () => {
  if (editingService.value) {
    serviceStore.updateService(editingService.value.id, serviceForm.value);
  } else {
    serviceStore.addService(serviceForm.value);
  }
  serviceDialog.value = false;
};

const saveTag = async () => {
  if (editingTag.value) {
    tagsStore.updateTag(editingTag.value.id, tagForm.value);
  } else {
    tagsStore.addTag(tagForm.value);
  }
  tagDialog.value = false;
};

const deleteService = async (serviceId) => {
  const confirmed = await confirmationStore.open(
    'Удаление услуги',
    'Вы уверены, что хотите удалить эту услугу?'
  );
  
  if (confirmed) {
    serviceStore.deleteService(serviceId);
  }
};

const deleteTag = async (tagId) => {
  const confirmed = await confirmationStore.open(
    'Удаление тега',
    'Вы уверены, что хотите удалить этот тег?'
  );
  
  if (confirmed) {
    tagsStore.deleteTag(tagId);
  }
};

onMounted(() => {
  serviceStore.loadServices();
  tagsStore.loadTags();
});
</script>

<style scoped>
.settings-content {
  padding: 16px;
}

.custom-tabs-container {
  position: relative;
  border-bottom: 2px solid #e0e0e0;
}

.custom-tabs-wrapper {
  display: flex;
}

.custom-tab {
  flex: 1;
  padding: 16px 24px;
  text-align: center;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.3s;
  background: transparent;
  border: none;
  font-size: 0.875rem;
}

.custom-tab:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.custom-tab.active {
  color: var(--v-theme-primary);
}

.custom-slider {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 50%;
  background-color: var(--v-theme-primary);
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.tags-container {
  max-width: 200px;
  overflow: hidden;
}

@media (max-width: 768px) {
  .settings-content {
    padding: 8px;
  }
  
  .custom-tab {
    padding: 12px 16px;
    font-size: 0.8rem;
  }
  
  .tags-container {
    max-width: 120px;
  }
}
</style>