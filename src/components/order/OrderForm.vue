<template>
  <v-card>
    <!-- ❗️ИСПРАВЛЕННАЯ ШАПКА: Используем v-card-title, как и положено в диалогах -->
    <v-card-title class="d-flex align-center">
      <v-btn icon="mdi-close" variant="text" @click="close" class="mr-2"></v-btn>
      <span>{{ isEditing ? 'Редактировать заказ' : 'Новый заказ' }}</span>
      <v-spacer></v-spacer>
      <v-btn
        :disabled="!isFormValid"
        color="primary"
        variant="tonal"
        @click="saveOrder"
      >
        Сохранить
      </v-btn>
    </v-card-title>

    <v-divider></v-divider>

    <!-- Контент формы с отступами -->
    <v-card-text>
      <v-form>
        <v-container fluid class="pa-0">
          <v-row dense>
            <v-col cols="12" class="pb-2"><div class="text-overline">Клиент</div></v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.clientName"
                label="Имя клиента *"
                :rules="[rules.required]"
                variant="filled"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.phone"
                label="Телефон"
                variant="filled"
              ></v-text-field>
            </v-col>

            <v-col cols="12" class="pb-2 pt-5"><div class="text-overline">Услуги</div></v-col>
            <v-col cols="12">
              <ServicesSelector v-model="form.services" />
            </v-col>

            <v-col cols="12" class="pb-2 pt-5"><div class="text-overline">Оплата и сроки</div></v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                :model-value="totalAmount"
                label="Общая сумма"
                variant="filled"
                readonly
                prefix="₽"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <DatePicker v-model="form.deadline" variant="filled" label="Дедлайн"/>
            </v-col>
            
            <v-col cols="12" class="pb-2 pt-5"><div class="text-overline">Дополнительно</div></v-col>
            <v-col cols="12">
              <v-textarea
                v-model="form.notes"
                label="Примечание"
                variant="filled"
                rows="3"
                auto-grow
              ></v-textarea>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { reactive, computed, watch } from 'vue';
import { useOrderStore } from '@/stores/orderStore.js';
import ServicesSelector from './ServicesSelector.vue';
import DatePicker from '../common/DatePicker.vue';

const props = defineProps({
  orderId: { type: [Number, null], default: null }
});

const emit = defineEmits(['close']);
const orderStore = useOrderStore();

const form = reactive({
  clientName: '',
  phone: '',
  services: [],
  deadline: new Date().toISOString().split('T')[0],
  notes: ''
});

const isEditing = computed(() => props.orderId !== null);
const totalAmount = computed(() => form.services.reduce((sum, s) => sum + Number(s.price || 0), 0));
const isFormValid = computed(() => form.clientName.trim() !== '' && form.services.length > 0);
const rules = { required: value => !!value || 'Обязательное поле' };

const resetForm = () => {
  Object.assign(form, { clientName: '', phone: '', services: [], deadline: new Date().toISOString().split('T')[0], notes: '' });
};

watch(() => props.orderId, (newId) => {
  if (newId) {
    const order = orderStore.getOrderById(newId);
    if (order) {
      form.clientName = order.clientName;
      form.phone = order.phone;
      form.services = JSON.parse(JSON.stringify(order.services));
      form.deadline = order.deadline;
      form.notes = order.notes;
    }
  } else {
    resetForm();
  }
}, { immediate: true });

const saveOrder = () => {
  if (!isFormValid.value) return;
  const orderData = {
    clientName: form.clientName,
    phone: form.phone,
    services: form.services,
    totalAmount: totalAmount.value,
    deadline: form.deadline,
    notes: form.notes,
  };

  if (isEditing.value) {
    orderStore.updateOrder(props.orderId, orderData);
  } else {
    orderStore.addOrder(orderData);
  }
  close();
};

const close = () => {
  emit('close');
};
</script>

<style scoped>
.text-overline {
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  font-size: 0.75rem !important;
}
.v-card-title {
  font-size: 1.25rem;
}
</style>