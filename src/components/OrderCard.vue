<!-- src/components/OrderCard.vue -->
<template>
  <v-card 
    class="order-card-md3"
    :class="{ 'order-card-expanded': expanded }"
    elevation="1"
    rounded="lg"
  >
    <!-- Основное содержимое карточки -->
    <div class="order-content" @click="expanded = !expanded">
      <!-- Заголовок с аватаром клиента -->
      <div class="order-header">
        <div class="client-section">
          <v-avatar 
            size="40" 
            color="primary-container"
            class="client-avatar"
          >
            <v-icon color="on-primary-container" size="20">mdi-account</v-icon>
          </v-avatar>
          
          <div class="client-info">
            <h3 class="client-name text-body-1 font-weight-medium">
              {{ order.clientName }}
            </h3>
            <div class="client-meta">
              <v-icon size="16" color="on-surface-variant">mdi-phone</v-icon>
              <span class="phone-number text-caption">{{ formatPhone(order.phone) }}</span>
              <v-chip 
                v-if="isOverdue" 
                size="x-small" 
                color="error" 
                class="ml-2"
              >
                Просрочен
              </v-chip>
            </div>
          </div>
        </div>

        <!-- Статус заказа -->
        <div class="status-section" @click.stop="cycleOrderStatus">
          <StatusIndicator :status="order.status" />
        </div>
      </div>

      <!-- Краткая информация -->
      <div class="order-preview">
        <div class="services-summary">
          <v-icon size="16" color="on-surface-variant" class="mr-1">mdi-format-list-bulleted</v-icon>
          <span class="text-caption text-medium-emphasis">{{ servicesPreview }}</span>
        </div>
        
        <div class="order-summary">
          <span class="total-amount text-body-2 font-weight-medium">{{ totalAmount }}₽</span>
          <span class="order-date text-caption text-medium-emphasis">
            {{ formatDate(order.createDate) }}
          </span>
        </div>
      </div>

      <!-- Быстрые действия (только в свернутом состоянии) -->
      <div v-if="!expanded" class="quick-actions">
        <div class="actions-row">
          <v-btn 
            icon="mdi-phone" 
            size="x-small" 
            variant="text" 
            color="success"
            :href="`tel:${order.phone}`"
            @click.stop
          ></v-btn>
          
          <v-btn 
            icon="mdi-message" 
            size="x-small" 
            variant="text" 
            color="primary"
            :href="`sms:${order.phone}`"
            @click.stop
          ></v-btn>
          
          <v-btn 
            icon="mdi-whatsapp" 
            size="x-small" 
            variant="text" 
            color="success"
            :href="`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}`"
            @click.stop
          ></v-btn>
          
          <v-spacer></v-spacer>
          
          <v-btn 
            icon="mdi-pencil" 
            size="x-small" 
            variant="text" 
            color="on-surface-variant"
            @click.stop="editOrder"
          ></v-btn>
          
          <v-btn 
            icon="mdi-delete" 
            size="x-small" 
            variant="text" 
            color="error"
            @click.stop="deleteOrder"
          ></v-btn>
        </div>
      </div>
    </div>

    <!-- Расширенная информация -->
    <v-expand-transition>
      <div v-if="expanded" class="expanded-content">
        <v-divider class="my-3"></v-divider>
        
        <div class="detailed-info">
          <!-- Детали заказа -->
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label text-caption text-medium-emphasis">Создан:</span>
              <span class="detail-value text-body-2">{{ formatDateTime(order.createDate) }}</span>
            </div>
            
            <div class="detail-item" v-if="order.deadline">
              <span class="detail-label text-caption text-medium-emphasis">Срок:</span>
              <span class="detail-value text-body-2" :class="{ 'text-error': isOverdue }">
                {{ formatDateTime(order.deadline) }}
              </span>
            </div>
          </div>

          <!-- Список услуг -->
          <div class="services-list">
            <h4 class="services-title text-caption text-medium-emphasis mb-2">Услуги:</h4>
            
            <div 
              v-for="(service, index) in order.services" 
              :key="index"
              class="service-item"
              @click.stop="updateServiceStatus(index)"
            >
              <div class="service-main">
                <div class="service-icon">
                  <v-icon 
                    size="20" 
                    :color="service.icon ? 'primary' : 'on-surface-variant'"
                  >
                    {{ service.icon || 'mdi-circle-small' }}
                  </v-icon>
                </div>
                
                <div class="service-details">
                  <div class="service-name text-body-2">{{ service.name }}</div>
                  <div class="service-price text-caption text-medium-emphasis">{{ service.price }}₽</div>
                </div>
              </div>
              
              <div class="service-status">
                <StatusIndicator :status="service.status" />
              </div>
            </div>
          </div>

          <!-- Итоговая сумма -->
          <div class="total-section">
            <v-divider class="mb-2"></v-divider>
            <div class="total-amount-expanded">
              <span class="text-body-1 font-weight-medium">Итого:</span>
              <span class="text-body-1 font-weight-bold text-primary">{{ totalAmount }}₽</span>
            </div>
          </div>

          <!-- Заметки -->
          <div class="notes-section" v-if="order.notes">
            <h4 class="notes-label text-caption text-medium-emphasis mb-1">Заметки:</h4>
            <div class="notes-content text-body-2">{{ order.notes }}</div>
          </div>

          <!-- Действия в расширенном режиме -->
          <div class="expanded-actions">
            <v-btn 
              variant="outlined" 
              color="primary"
              prepend-icon="mdi-pencil"
              @click.stop="editOrder"
              size="small"
              block
            >
              Редактировать заказ
            </v-btn>
            
            <v-btn 
              variant="outlined" 
              color="error"
              prepend-icon="mdi-delete"
              @click.stop="deleteOrder"
              size="small"
              block
              class="mt-2"
            >
              Удалить заказ
            </v-btn>
          </div>
        </div>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useOrderStore } from '@/stores/orderStore';
import { useConfirmationStore } from '@/stores/confirmationStore';
import StatusIndicator from '@/components/common/StatusIndicator.vue';

const orderStore = useOrderStore();
const confirmationStore = useConfirmationStore();

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['edit', 'delete']);

// Локальное состояние
const expanded = ref(false);

// Computed свойства
const servicesPreview = computed(() => {
  if (!props.order.services || props.order.services.length === 0) {
    return 'Нет услуг';
  }
  
  const names = props.order.services.map(s => s.name);
  if (names.length <= 2) {
    return names.join(', ');
  }
  
  return `${names.slice(0, 2).join(', ')} и еще ${names.length - 2}`;
});

const totalAmount = computed(() => {
  return props.order.services?.reduce((sum, service) => sum + (service.price || 0), 0) || 0;
});

const isOverdue = computed(() => {
  if (!props.order.deadline) return false;
  
  const deadline = new Date(props.order.deadline);
  const now = new Date();
  return deadline < now && props.order.status !== 'delivered' && props.order.status !== 'cancelled';
});

// Методы
const cycleOrderStatus = async () => {
  const result = orderStore.cycleOrderStatus(props.order.id);
  
  if (result && result.needsConfirmation) {
    const confirmed = await confirmationStore.open('Изменение статуса', result.message);
    if (confirmed && result.onConfirm) {
      result.onConfirm();
    }
  }
  
  // Тактильная обратная связь
  if ('vibrate' in navigator) {
    navigator.vibrate(30);
  }
};

const updateServiceStatus = (serviceIndex) => {
  const currentStatus = props.order.services[serviceIndex].status;
  const newStatus = currentStatus === 'in_progress' ? 'completed' : 'in_progress';
  
  orderStore.updateServiceStatus(props.order.id, serviceIndex, newStatus);
  
  if ('vibrate' in navigator) {
    navigator.vibrate(20);
  }
};

const editOrder = () => {
  emit('edit', props.order);
};

const deleteOrder = async () => {
  const confirmed = await confirmationStore.open(
    'Удаление заказа',
    `Вы уверены, что хотите удалить заказ для ${props.order.clientName}?`
  );
  
  if (confirmed) {
    emit('delete', props.order.id);
  }
};

const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
  }
  return phone;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
.order-card-md3 {
  margin-bottom: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border: 1px solid transparent;
}

.order-card-md3:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  border-color: rgba(var(--v-theme-primary), 0.1);
}

.order-card-expanded {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2) !important;
}

.order-content {
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.order-content:hover {
  background-color: rgba(var(--v-theme-primary), 0.02);
}

/* Заголовок карточки */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.client-section {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.client-avatar {
  flex-shrink: 0;
}

.client-info {
  flex: 1;
  min-width: 0;
}

.client-name {
  margin: 0 0 4px 0;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.client-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.phone-number {
  font-weight: 500;
}

.status-section {
  flex-shrink: 0;
  margin-left: 12px;
  cursor: pointer;
}

/* Превью заказа */
.order-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.services-summary {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.order-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  margin-left: 12px;
}

.total-amount {
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}

/* Быстрые действия */
.quick-actions {
  margin-top: 8px;
}

.actions-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Расширенное содержимое */
.expanded-content {
  animation: expandIn 0.3s ease-out;
}

@keyframes expandIn {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}

.detailed-info {
  padding: 0 8px;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-weight: 500;
}

.detail-value {
  color: rgb(var(--v-theme-on-surface));
}

/* Список услуг */
.services-list {
  margin-bottom: 16px;
}

.services-title {
  font-weight: 500;
}

.service-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: rgba(var(--v-theme-surface-variant), 0.05);
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.service-item:hover {
  background: rgba(var(--v-theme-primary), 0.08);
}

.service-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.service-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  flex-shrink: 0;
}

.service-details {
  flex: 1;
}

.service-name {
  margin-bottom: 2px;
  color: rgb(var(--v-theme-on-surface));
}

.service-price {
  font-weight: 500;
}

.service-status {
  flex-shrink: 0;
  margin-left: 12px;
}

/* Итоговая сумма */
.total-section {
  margin-bottom: 16px;
}

.total-amount-expanded {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Заметки */
.notes-section {
  margin-bottom: 16px;
}

.notes-label {
  font-weight: 500;
}

.notes-content {
  background: rgba(var(--v-theme-surface-variant), 0.1);
  padding: 12px;
  border-radius: 8px;
  line-height: 1.4;
  color: rgb(var(--v-theme-on-surface));
}

/* Действия в расширенном режиме */
.expanded-actions {
  margin-top: 16px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .order-content {
    padding: 12px;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .order-preview {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .order-summary {
    margin-left: 0;
    align-self: flex-end;
  }
  
  .service-item {
    padding: 6px;
  }
  
  .service-main {
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .client-section {
    gap: 8px;
  }
  
  .client-name {
    font-size: 14px;
  }
  
  .actions-row .v-btn {
    min-width: 32px;
    height: 32px;
  }
}

/* Touch-friendly улучшения */
@media (pointer: coarse) {
  .order-content {
    min-height: 88px;
  }
  
  .status-section,
  .service-item {
    min-height: 44px;
  }
  
  .actions-row .v-btn {
    min-width: 44px;
    min-height: 44px;
  }
}
</style>