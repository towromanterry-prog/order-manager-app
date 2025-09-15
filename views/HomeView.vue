<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    
    <main class="container mx-auto px-4 py-6">
      <!-- Календарь (упрощенный) -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div class="flex justify-center space-x-4">
          <button
            v-for="day in weekDays"
            :key="day.date"
            @click="selectDate(day.date)"
            :class="{
              'bg-blue-500 text-white': day.date === selectedDate,
              'bg-gray-100': day.date !== selectedDate
            }"
            class="w-12 h-12 rounded-full flex items-center justify-center"
          >
            {{ day.label }}
          </button>
        </div>
      </div>

      <!-- Список заказов -->
      <div>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-800">Заказы</h2>
          <button
            @click="showCreateForm = true"
            class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            + Добавить
          </button>
        </div>

        <div v-if="orders.length === 0" class="text-center py-8 text-gray-500">
          Заказов пока нет
        </div>

        <div v-else>
          <OrderCard
            v-for="order in orders"
            :key="order.id"
            :order="order"
            @edit="editOrder"
          />
        </div>
      </div>
    </main>

    <!-- Простая форма создания заказа -->
    <div v-if="showCreateForm" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Новый заказ</h3>
        
        <form @submit.prevent="createOrder" class="space-y-4">
          <input
            v-model="form.clientName"
            type="text"
            placeholder="Имя клиента"
            required
            class="w-full px-3 py-2 border rounded-md"
          />
          
          <input
            v-model="form.phone"
            type="tel"
            placeholder="Телефон"
            required
            class="w-full px-3 py-2 border rounded-md"
          />
          
          <input
            v-model="form.totalAmount"
            type="number"
            placeholder="Сумма"
            required
            class="w-full px-3 py-2 border rounded-md"
          />
          
          <input
            v-model="form.deadline"
            type="date"
            required
            class="w-full px-3 py-2 border rounded-md"
          />

          <div class="flex space-x-3">
            <button
              type="button"
              @click="showCreateForm = false"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-md"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useOrdersStore } from '@/stores/orders';
import AppHeader from '@/components/AppHeader.vue';
import OrderCard from '@/components/OrderCard.vue';
import type { OrderDocument } from '@/types';

const ordersStore = useOrdersStore();
const showCreateForm = ref(false);

const form = reactive({
  clientName: '',
  phone: '',
  totalAmount: 0,
  deadline: ''
});

const weekDays = computed(() => [
  { label: 'Пн', date: '2025-11-01' },
  { label: 'Вт', date: '2025-11-02' },
  { label: 'Ср', date: '2025-11-03' },
  { label: 'Чт', date: '2025-11-04' },
  { label: 'Пт', date: '2025-11-05' }
]);

const selectedDate = computed(() => ordersStore.selectedDate);
const orders = computed(() => ordersStore.orders);

const selectDate = (date: string) => {
  ordersStore.selectedDate = date;
};

const createOrder = async () => {
  await ordersStore.createOrder({
    ...form,
    services: ['Консультация'],
    status: 'new'
  });
  
  // Сброс формы
  Object.assign(form, {
    clientName: '',
    phone: '',
    totalAmount: 0,
    deadline: ''
  });
  
  showCreateForm.value = false;
};

const editOrder = (order: OrderDocument) => {
  console.log('Editing order:', order);
  // Здесь будет логика редактирования
};
</script>
