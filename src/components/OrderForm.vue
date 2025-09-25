<!-- src/components/OrderForm.vue -->
<template>
  <v-card class="order-form-container">
    <v-card-title class="form-header">
      <v-icon class="mr-2">{{ orderId ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
      {{ orderId ? 'Редактирование заказа' : 'Новый заказ' }}
      <v-spacer></v-spacer>
      <v-btn icon="mdi-close" variant="text" @click="$emit('close')"></v-btn>
    </v-card-title>

    <v-card-text>
      <v-form ref="formRef" v-model="formValid" @submit.prevent="saveOrder">
        <!-- Клиент -->
        <div class="form-section">
          <h3 class="section-title">Информация о клиенте</h3>
          
          <v-text-field
            v-model="formData.clientName"
            label="Имя клиента*"
            :rules="[v => !!v || 'Обязательное поле']"
            variant="outlined"
            density="comfortable"
          ></v-text-field>

          <v-text-field
            v-model="formData.phone"
            label="Телефон*"
            :rules="[v => !!v || 'Обязательное поле']"
            variant="outlined"
            density="comfortable"
          ></v-text-field>
        </div>

        <!-- Услуги -->
        <div class="form-section">
          <div class="section-header">
            <h3 class="section-title">Услуги</h3>
            <v-btn 
              color="primary" 
              variant="text" 
              @click="addService"
              prepend-icon="mdi-plus"
            >
              Добавить услугу
            </v-btn>
          </div>

          <div v-for="(service, index) in formData.services" :key="index" class="service-item">
            <v-row dense>
              <v-col cols="5">
                <v-autocomplete
                  v-model="service.name"
                  :items="availableServices"
                  item-title="name"
                  item-value="name"
                  label="Услуга*"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => !!v || 'Выберите услугу']"
                ></v-autocomplete>
              </v-col>
              <v-col cols="5">
                <v-text-field
                  v-model.number="service.price"
                  label="Цена*"
                  type="number"
                  prefix="₽"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => v > 0 || 'Цена должна быть больше 0']"
                ></v-text-field>
              </v-col>
              <v-col cols="2" class="d-flex align-center">
                <v-btn 
                  icon="mdi-delete" 
                  color="error" 
                  variant="text"
                  @click="removeService(index)"
                  :disabled="formData.services.length === 1"
                ></v-btn>
              </v-col>
            </v-row>
          </div>
        </div>

        <!-- Даты -->
        <div class="form-section">
          <h3 class="section-title">Даты</h3>
          
          <v-text-field
            v-model="formData.deadline"
            label="Срок выполнения*"
            type="date"
            :rules="[v => !!v || 'Обязательное поле']"
            variant="outlined"
            density="comfortable"
          ></v-text-field>
        </div>

        <!-- Заметки -->
        <div class="form-section">
          <h3 class="section-title">Дополнительно</h3>
          
          <v-textarea
            v-model="formData.notes"
            label="Заметки"
            variant="outlined"
            density="comfortable"
            rows="3"
          ></v-textarea>
        </div>
      </v-form>
    </v-card-text>

    <v-card-actions class="form-actions">
      <v-spacer></v-spacer>
      <v-btn variant="text" @click="$emit('close')">Отмена</v-btn>
      <v-btn 
        color="primary" 
        variant="flat" 
        @click="saveOrder"
        :loading="saving"
        :disabled="!formValid"
      >
        {{ orderId ? 'Сохранить' : 'Создать' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useOrderStore } from '@/stores/orderStore';
import { useClientsStore } from '@/stores/clientsStore';
import { useServiceStore } from '@/stores/serviceStore';

const orderStore = useOrderStore();
const clientsStore = useClientsStore();
const serviceStore = useServiceStore();

const props = defineProps({
  orderId: {
    type: String,
    default: null
  },
  initialData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close', 'saved']);

const formRef = ref(null);
const formValid = ref(false);
const saving = ref(false);

const formData = ref({
  clientName: '',
  phone: '',
  services: [{ name: '', price: 0, status: 'in_progress' }],
  deadline: '',
  notes: ''
});

// Доступные услуги из хранилища
const availableServices = computed(() => {
  return serviceStore.services.map(service => ({
    name: service.name,
    price: service.defaultPrice
  }));
});

// Загрузка данных при редактировании
watch(() => props.orderId, (newOrderId) => {
  if (newOrderId) {
    loadOrderData(newOrderId);
  } else {
    resetForm();
  }
}, { immediate: true });

// Применение initialData для нового заказа
watch(() => props.initialData, (newData) => {
  if (newData && Object.keys(newData).length > 0 && !props.orderId) {
    Object.assign(formData.value, {
      ...formData.value,
      ...newData,
      services: newData.services && newData.services.length > 0 
        ? newData.services 
        : formData.value.services
    });
  }
}, { immediate: true });

const resetForm = () => {
  formData.value = {
    clientName: '',
    phone: '',
    services: [{ name: '', price: 0, status: 'in_progress' }],
    deadline: '',
    notes: ''
  };
};

const loadOrderData = (orderId) => {
  const order = orderStore.orders.find(o => o.id === orderId);
  if (order) {
    formData.value = {
      clientName: order.clientName || '',
      phone: order.phone || '',
      services: order.services && order.services.length > 0 
        ? order.services.map(s => ({ ...s }))
        : [{ name: '', price: 0, status: 'in_progress' }],
      deadline: order.deadline || '',
      notes: order.notes || ''
    };
  }
};

const addService = () => {
  formData.value.services.push({
    name: '',
    price: 0,
    status: 'in_progress'
  });
};

const removeService = (index) => {
  if (formData.value.services.length > 1) {
    formData.value.services.splice(index, 1);
  }
};

// Автозаполнение цены при выборе услуги
watch(() => formData.value.services, (services) => {
  services.forEach((service, index) => {
    if (service.name && !service.price) {
      const selectedService = availableServices.value.find(s => s.name === service.name);
      if (selectedService) {
        formData.value.services[index].price = selectedService.price;
      }
    }
  });
}, { deep: true });

const saveOrder = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  
  saving.value = true;
  
  try {
    // Сохраняем клиента
    clientsStore.addOrUpdateClient({
      name: formData.value.clientName,
      phone: formData.value.phone
    });

    // Подготавливаем данные заказа
    const orderData = {
      clientName: formData.value.clientName,
      phone: formData.value.phone,
      services: formData.value.services
        .filter(s => s.name && s.price > 0)
        .map(s => ({
          name: s.name,
          price: Number(s.price),
          status: s.status || 'in_progress'
        })),
      // Для нового заказа всегда ставим статус "в работе"
      status: 'in_progress',
      deadline: formData.value.deadline,
      notes: formData.value.notes || '',
      createDate: props.orderId 
        ? orderStore.orders.find(o => o.id === props.orderId)?.createDate 
        : new Date().toISOString()
    };

    // Сохраняем заказ
    if (props.orderId) {
      orderStore.updateOrder(props.orderId, orderData);
    } else {
      orderStore.addOrder(orderData);
    }

    emit('saved');
    emit('close');
  } catch (error) {
    console.error('Ошибка сохранения заказа:', error);
  } finally {
    saving.value = false;
  }
};

// Загружаем услуги при монтировании
onMounted(() => {
  serviceStore.loadServices();
});
</script>

<style scoped>
.order-form-container {
  max-width: 600px;
  margin: 0 auto;
}

.form-header {
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgb(var(--v-theme-outline));
}

.form-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 16px;
  color: rgb(var(--v-theme-on-surface));
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.service-item {
  margin-bottom: 12px;
  padding: 12px;
  background: rgba(var(--v-theme-surface-variant), 0.1);
  border-radius: 8px;
}

.form-actions {
  background: rgb(var(--v-theme-surface));
  border-top: 1px solid rgb(var(--v-theme-outline));
  padding: 16px 24px;
}

@media (max-width: 768px) {
  .order-form-container {
    margin: 0;
    border-radius: 0;
    min-height: 100vh;
  }
  
  .service-item {
    padding: 8px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>