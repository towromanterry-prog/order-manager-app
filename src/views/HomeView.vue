<template>
  <div class="home-view-wrapper" :class="{ 'full-calendar-active': showFullCalendar }">
    <div class="main-content-area">
      <!-- 1. Мини календарь -->
      <div class="calendar-wrapper" :class="{ 'calendar-hidden': showFullCalendar }">
        <div class="calendar-container">
          <ScrollShadowWrapper>
            <div class="calendar-days-flex" ref="calendarDaysContainer">
              <div v-for="day in weekDays" :key="day.date" class="px-1">
                <div
                  class="calendar-day"
                  :class="{
                    'active': selectedDate === day.date,
                    'is-today': day.isToday
                  }"
                  @click="selectDate(day.date)"
                >
                  <div v-if="day.isToday" class="current-dot"></div>
                  <div class="day-content">
                    <div class="day-initial">{{ day.initial }}</div>
                    <div class="day-number">{{ day.number }}</div>
                  </div>
                  <div v-if="day.orderStats.total" class="day-badges">
                    <span v-if="day.orderStats.inProgress" class="badge in-progress">{{ day.orderStats.inProgress }}</span>
                    <span v-if="day.orderStats.completed" class="badge completed">{{ day.orderStats.completed }}</span>
                    <span v-if="day.orderStats.delivered" class="badge delivered">{{ day.orderStats.delivered }}</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollShadowWrapper>
        </div>
      </div>

      <!-- 2. Список заказов -->
      <div class="orders-list-container" ref="scrollContainer">
        <div v-if="refreshing" class="pull-refresh-indicator">
          <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
          <span class="ml-2 text-caption">Обновление...</span>
        </div>
        <div v-if="!filteredOrders.length" class="empty-state">
          <v-icon size="48" color="grey-lighten-1">mdi-clipboard-text-outline</v-icon>
          <h3 class="mt-4">{{ selectedDate ? 'Нет заказов на эту дату' : 'Нет активных заказов' }}</h3>
          <p class="text-grey">{{ selectedDate ? 'Выберите другую дату или сбросьте фильтр.' : 'Создайте новый заказ, чтобы он появился здесь.' }}</p>
        </div>
        <v-container v-else fluid class="pa-0">
          <v-row dense>
            <v-col
              v-for="order in filteredOrders"
              :key="order.id"
              cols="12"
            >
              <OrderCard
                :order="order"
                @edit="editOrder"
                @delete="confirmDelete"
                class="order-card-item"
              />
            </v-col>
          </v-row>
        </v-container>
      </div>
    </div>

    <!-- 3. Полноэкранный календарь -->
    <transition name="slide-from-bottom">
      <div v-if="showFullCalendar" class="full-calendar-section">
        <div class="full-calendar-container">
          <div class="full-calendar-header-compact">
              <div class="month-navigation">
                  <v-btn 
                    icon="mdi-chevron-left" 
                    variant="text" 
                    size="x-small"
                    @click="previousMonth"
                  ></v-btn>
                  <h2 class="text-subtitle-1 font-weight-medium mx-3">{{ currentMonthName }} {{ currentYear }}</h2>
                  <v-btn 
                    icon="mdi-chevron-right" 
                    variant="text" 
                    size="x-small"
                    @click="nextMonth"
                  ></v-btn>
              </div>
              <v-btn 
                icon="mdi-close" 
                variant="text" 
                size="x-small"
                @click="closeFullCalendar"
              ></v-btn>
          </div>
          <div class="full-calendar-content">
            <div class="full-calendar-grid">
                <div class="calendar-week-header">
                    <div v-for="dayName in ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']" :key="dayName" class="week-day-header">{{ dayName }}</div>
                </div>
                <div class="calendar-weeks">
                  <div v-for="week in calendarWeeks" :key="week.weekIndex" class="calendar-week">
                      <div
                          v-for="day in week.days"
                          :key="day.date || day.emptyKey"
                          class="full-calendar-day"
                          :class="{
                              'active': selectedDate === day.date,
                              'is-today': day.isToday,
                              'other-month': day.otherMonth,
                              'empty': !day.date
                          }"
                          @click="day.date && selectDateFromFullCalendar(day.date)"
                      >
                          <div v-if="day.date" class="day-content">
                              <div class="day-number">{{ day.number }}</div>
                              <div v-if="day.orderStats && day.orderStats.total" class="day-badges">
                                <span v-if="day.orderStats.inProgress" class="badge in-progress">{{ day.orderStats.inProgress }}</span>
                                <span v-if="day.orderStats.completed" class="badge completed">{{ day.orderStats.completed }}</span>
                                <span v-if="day.orderStats.delivered" class="badge delivered">{{ day.orderStats.delivered }}</span>
                              </div>
                          </div>
                      </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 4. FAB кнопки -->
    <div class="fab-buttons">
      <v-btn 
        icon="mdi-plus" 
        size="large" 
        color="primary" 
        class="fab-create" 
        :class="{ 'fab-create-above-calendar': showFullCalendar }"
        @click="createOrder"
      ></v-btn>
      
      <!-- ОБНОВЛЕНО: FAB календарь с долгим нажатием и динамической иконкой -->
      <v-tooltip location="left">
        <template v-slot:activator="{ props }">
          <v-btn 
            :icon="sortBy === 'deadline' ? 'mdi-timer-sand' : 'mdi-history'"
            size="large" 
            color="secondary" 
            class="fab-calendar" 
            :class="{ 'fab-calendar-hidden': showFullCalendar }"
            v-bind="props"
            @click="toggleFullCalendar"
            @touchstart="startLongPress"
            @touchend="endLongPress"
            @mousedown="startLongPress"
            @mouseup="endLongPress"
            @mouseleave="endLongPress"
          ></v-btn>
        </template>
        <span>{{ sortBy === 'deadline' ? 'Сортировка: До дедлайна ⏳' : 'Сортировка: По времени создания 🕐' }}</span>
        <br><small>Долгое нажатие - переключить</small>
      </v-tooltip>
    </div>

    <!-- 5. Диалог создания/редактирования заказа -->
    <v-dialog v-model="showOrderForm" fullscreen :persistent="false" transition="dialog-bottom-transition">
      <OrderForm 
        :order-id="orderToEditId"
        :initial-data="initialOrderData"
        @close="closeForm" 
        @saved="handleOrderSaved" 
      />
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOrderStore } from '@/stores/orderStore.js';
import { useClientsStore } from '@/stores/clientsStore.js';
import { useSettingsStore } from '@/stores/settingsStore.js';
import { useConfirmationStore } from '@/stores/confirmationStore.js';
import { storeToRefs } from 'pinia';
import OrderCard from '@/components/OrderCard.vue';
import OrderForm from '@/components/OrderForm.vue';
import ScrollShadowWrapper from '@/components/common/ScrollShadowWrapper.vue';

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();
const clientsStore = useClientsStore();
const settingsStore = useSettingsStore();
const confirmationStore = useConfirmationStore();

const { orders } = storeToRefs(orderStore);

const calendarDaysContainer = ref(null);
const showOrderForm = ref(false);
const orderToEditId = ref(null);
const selectedDate = ref(null);
const showFullCalendar = ref(false);
const refreshing = ref(false);
const initialOrderData = ref({});

// Сортировка с сохранением в localStorage
const sortBy = ref(localStorage.getItem('orderSortBy') || 'deadline');

const setSortBy = (value) => {
  sortBy.value = value;
  localStorage.setItem('orderSortBy', value);
};

// Долгое нажатие для переключения сортировки
let longPressTimer = null;
const longPressTriggered = ref(false);

const startLongPress = (event) => {
  longPressTriggered.value = false;
  longPressTimer = setTimeout(() => {
    longPressTriggered.value = true;
    
    // Переключить сортировку
    const newSort = sortBy.value === 'deadline' ? 'createDate' : 'deadline';
    setSortBy(newSort);
    
    // Вибрация обратной связи
    if (settingsStore.appSettings?.enableHapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(100);
    }
  }, 800); // 800ms = долгое нажатие
};

const endLongPress = () => {
  clearTimeout(longPressTimer);
};

// ДОБАВЛЕНО: Функция для правильного форматирования локальной даты
const getLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const currentDate = ref(new Date());
const today = new Date();
today.setHours(0, 0, 0, 0);
const todayStr = getLocalDateString(today); // ИСПРАВЛЕНО: используем локальную дату

const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth());
const currentMonthName = computed(() => {
    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    return monthNames[currentMonth.value];
});

// ИСПРАВЛЕНО: локальное форматирование дат в мини календаре
const weekDays = computed(() => {
  const dayNames = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  return Array.from({ length: 29 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i - 14);
    const ds = getLocalDateString(d); // ИСПРАВЛЕНО: используем локальную дату
    const dayOrders = orders.value.filter(o => {
      if (sortBy.value === 'deadline') {
        return o.deadline?.startsWith(ds);
      } else {
        return o.createDate?.startsWith(ds);
      }
    });
    return {
      date: ds,
      initial: dayNames[d.getDay()],
      number: d.getDate(),
      isToday: ds === todayStr,
      orderStats: {
        total: dayOrders.length,
        inProgress: dayOrders.filter(o => o.status === 'in_progress').length,
        completed: dayOrders.filter(o => o.status === 'completed').length,
        delivered: dayOrders.filter(o => o.status === 'delivered').length,
      }
    };
  });
});

// ИСПРАВЛЕНО: локальное форматирование дат в полном календаре
const calendarWeeks = computed(() => {
    const year = currentYear.value;
    const month = currentMonth.value;
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1));

    const weeks = [];
    for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
        const week = { weekIndex, days: [] };
        for (let i = 0; i < 7; i++) {
            const currentCalendarDate = new Date(startDate);
            const dateStr = getLocalDateString(currentCalendarDate); // ИСПРАВЛЕНО: используем локальную дату
            const isCurrentMonth = currentCalendarDate.getMonth() === month;

            if (isCurrentMonth) {
                const dayOrders = orders.value.filter(o => {
                  if (sortBy.value === 'deadline') {
                    return o.deadline?.startsWith(dateStr);
                  } else {
                    return o.createDate?.startsWith(dateStr);
                  }
                });
                week.days.push({
                    date: dateStr,
                    number: currentCalendarDate.getDate(),
                    isToday: dateStr === todayStr,
                    otherMonth: false,
                    orderStats: {
                      total: dayOrders.length,
                      inProgress: dayOrders.filter(o => o.status === 'in_progress').length,
                      completed: dayOrders.filter(o => o.status === 'completed').length,
                      delivered: dayOrders.filter(o => o.status === 'delivered').length
                    }
                });
            } else {
                week.days.push({
                    date: null,
                    number: currentCalendarDate.getDate(),
                    otherMonth: true,
                    emptyKey: `w${weekIndex}-i${i}`,
                    isToday: false,
                });
            }
            startDate.setDate(startDate.getDate() + 1);
        }
        weeks.push(week);
    }
    return weeks;
});

// filteredOrders с учетом сортировки
const filteredOrders = computed(() => {
  if (!selectedDate.value) {
    return [...orders.value]
      .filter(order => settingsStore.appSettings?.showCompletedOrders ? true : order.status !== 'delivered')
      .sort((a, b) => {
        if (sortBy.value === 'deadline') {
          return new Date(b.deadline || b.createDate) - new Date(a.deadline || a.createDate);
        } else {
          return new Date(b.createDate) - new Date(a.createDate);
        }
      });
  } else {
    return orders.value
      .filter(order => {
        if (sortBy.value === 'deadline') {
          return order.deadline?.startsWith(selectedDate.value);
        } else {
          return order.createDate?.startsWith(selectedDate.value);
        }
      })
      .filter(order => settingsStore.appSettings?.showCompletedOrders ? true : order.status !== 'delivered')
      .sort((a, b) => {
        if (sortBy.value === 'deadline') {
          return new Date(b.deadline || b.createDate) - new Date(a.deadline || a.createDate);
        } else {
          return new Date(b.createDate) - new Date(a.createDate);
        }
      });
  }
});

const previousMonth = () => {
    const newDate = new Date(currentDate.value);
    newDate.setMonth(newDate.getMonth() - 1);
    currentDate.value = newDate;
};

const nextMonth = () => {
    const newDate = new Date(currentDate.value);
    newDate.setMonth(newDate.getMonth() + 1);
    currentDate.value = newDate;
};

const selectDate = (date) => {
  if (selectedDate.value === date) {
    selectedDate.value = null; 
  } else {
    selectedDate.value = date;
  }
};

// ИСПРАВЛЕНО: второе нажатие для отмены выбора в большом календаре  
const selectDateFromFullCalendar = (date) => {
    if (selectedDate.value === date) {
      selectedDate.value = null; 
    } else {
      selectedDate.value = date;
    }
};

const toggleFullCalendar = () => {
  // Проверить, было ли долгое нажатие
  if (longPressTriggered.value) {
    longPressTriggered.value = false;
    return; // Не открывать календарь после долгого нажатия
  }
  
  showFullCalendar.value = !showFullCalendar.value;
};

const closeFullCalendar = () => {
  showFullCalendar.value = false;
};

const createOrder = () => {
  orderToEditId.value = null;
  initialOrderData.value = {};
  if (route.query.clientName || route.query.clientPhone) {
      initialOrderData.value = {
          clientName: route.query.clientName,
          phone: route.query.clientPhone,
          deadline: selectedDate.value || todayStr
      };
  } else if (selectedDate.value) {
      initialOrderData.value = { deadline: selectedDate.value };
  }
  showOrderForm.value = true;
};

const editOrder = (order) => {
  orderToEditId.value = order.id;
  initialOrderData.value = {};
  showOrderForm.value = true;
};

const confirmDelete = async (orderId) => {
  const confirmed = await confirmationStore.open('Удалить заказ?', 'Это действие нельзя будет отменить.');
  if (confirmed) {
    orderStore.deleteOrder(orderId);
    if (settingsStore.appSettings?.enableHapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }
};

const closeForm = () => {
  showOrderForm.value = false;
  orderToEditId.value = null;
  initialOrderData.value = {};
   if (route.query.clientName || route.query.clientPhone) {
    router.replace({ name: 'home' });
  }
};

const handleOrderSaved = () => {
  if (settingsStore.appSettings?.enableHapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
  }
};

const handlePullToRefresh = async () => {
  if (!settingsStore.appSettings?.enablePullToRefresh) return;
  refreshing.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await orderStore.load();
    await clientsStore.loadClients();
  } finally {
    refreshing.value = false;
  }
};

watch(() => route.query, (newQuery) => {
  if (newQuery.action === 'create') {
    createOrder();
  }
}, { immediate: true });

onMounted(async () => {
  await nextTick();
  const container = calendarDaysContainer.value;
  if (!container) return;

  const todayElement = container.querySelector('.is-today');
  if (todayElement) {
    const scrollParent = container.parentElement;
    if (scrollParent && typeof scrollParent.getBoundingClientRect === 'function') {
      const parentRect = scrollParent.getBoundingClientRect();
      const childRect = todayElement.getBoundingClientRect();
      const scrollOffset = childRect.left - parentRect.left - (parentRect.width / 2) + (childRect.width / 2);
      scrollParent.scrollTo({ left: scrollOffset, behavior: 'auto' });
    }
  }
});
</script>

<style scoped>
.home-view-wrapper {
  height: calc(100vh - 60px); 
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  transition: padding-bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.home-view-wrapper.full-calendar-active {
  padding-bottom: 340px;
}

.main-content-area {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 0;
}

.calendar-wrapper {
  flex-shrink: 0;
  height: 81px; 
  transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
  z-index: 2;
  background-color: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.calendar-wrapper.calendar-hidden {
  height: 0;
  border-bottom: none;
}

.calendar-container {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.calendar-wrapper.calendar-hidden .calendar-container {
  transform: translateY(-100%);
}

.orders-list-container {
  flex-grow: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none; /* ДОБАВЛЕНО: убрать полосу прокрутки Firefox */
  -ms-overflow-style: none; /* ДОБАВЛЕНО: убрать полосу прокрутки IE */
  margin: 8px;
  padding: 8px;
  position: relative;
  z-index: 1;
  background-color: rgb(var(--v-theme-secondary));
  border-radius: 16px;
  box-shadow: 
    0 10px 15px -3px rgba(0, 0, 0, 0.1), 
    0 4px 6px -2px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(0, 0, 0, 0.05);
}

/* ДОБАВЛЕНО: убрать полосу прокрутки Webkit */
.orders-list-container::-webkit-scrollbar {
  display: none;
}

.pull-refresh-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background-color: rgba(var(--v-theme-primary), 0.1);
  border-radius: 8px;
  margin-bottom: 16px;
}

.order-card-item {
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.calendar-days-flex {
  display: flex;
  align-items: center;
  padding: 4px 8px;
}

.calendar-day {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 56px;
  height: 72px;
  border-radius: 16px;
  cursor: pointer;
  padding: 4px;
  justify-content: center;
  align-items: center;
  transition: color 0.2s, background-color 0.2s;
}

.day-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.current-dot {
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 5px;
    height: 5px;
    background-color: rgb(var(--v-theme-primary));
    border-radius: 50%;
}

.day-initial {
  font-size: 13px;
  text-transform: capitalize;
  line-height: 1;
  transition: color 0.2s;
}

.day-number {
  font-size: 18px;
  font-weight: 500;
  line-height: 1.2;
  transition: color 0.2s;
}

.calendar-day.active {
  background-color: transparent !important;
}

.calendar-day:not(.active):hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.calendar-day.active .day-number,
.calendar-day.active .day-initial {
  color: rgb(var(--v-theme-primary));
}

.calendar-day.active .day-number {
    font-weight: 700;
}

.day-badges {
  position: absolute;
  bottom: 6px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 3px;
}

.badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  color: white;
  padding: 0 4px;
  border: 1px solid rgba(var(--v-theme-surface), 0.5);
}

/* ИСПРАВЛЕНО: синхронизированы CSS классы статусов */
.badge.in-progress { background-color: #FB8C00; }
.badge.completed { background-color: #1976D2; }
.badge.delivered { background-color: #43A047; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 70%;
}

.fab-buttons {
    position: fixed;
    bottom: 80px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 1000;
}

.fab-create, .fab-calendar {
    box-shadow: 0 3px 5px -1px rgba(0,0,0,.2), 0 6px 10px 0 rgba(0,0,0,.14), 0 1px 18px 0 rgba(0,0,0,.12);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-create-above-calendar {
    bottom: calc(340px + 16px);
    position: fixed;
    right: 20px;
    z-index: 1002;
}

/* ИСПРАВЛЕНО: FAB календарь не перекрывает полный календарь */
.fab-calendar-hidden {
    transform: translateX(100px);
    opacity: 0;
    pointer-events: none !important;
    z-index: -1 !important;
}

/* ИСПРАВЛЕНО: увеличен z-index полного календаря */
.full-calendar-section {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgb(var(--v-theme-surface));
    border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    height: 340px;
    z-index: 1001;
}

.slide-from-bottom-enter-active,
.slide-from-bottom-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-from-bottom-enter-from,
.slide-from-bottom-leave-to {
  transform: translateY(100%);
}

.full-calendar-container {
    width: 100%;
    background-color: rgb(var(--v-theme-surface));
    display: flex;
    flex-direction: column;
    height: 100%;
}

.full-calendar-header-compact {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    flex-shrink: 0;
    height: 56px;
}

.month-navigation {
    display: flex;
    align-items: center;
}

.full-calendar-content {
    flex: 1;
    overflow: hidden;
    padding: 8px 12px 0 12px;
    display: flex;
    align-items: center;
    height: 272px;
}

.full-calendar-grid {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
}

.calendar-week-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
    margin-bottom: 6px;
    height: 24px;
}

.week-day-header {
    text-align: center;
    font-size: 13px;
    font-weight: 500;
    padding: 4px 2px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.calendar-weeks {
    display: flex;
    flex-direction: column;
    gap: 2px;
    height: 234px;
    justify-content: space-between;
}

.calendar-week {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
    height: 36px;
}

.full-calendar-day {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
    position: relative;
    height: 100%;
    padding-top: 2px;
}

.full-calendar-day:not(.empty):not(.other-month):hover {
    background-color: rgba(var(--v-theme-primary), 0.08);
}

.full-calendar-day.active {
    background-color: rgba(var(--v-theme-primary), 0.12);
}

/* ИСПРАВЛЕНО: убран кружок у текущей даты в полном календаре */
.full-calendar-day.is-today .day-number {
    color: rgb(var(--v-theme-primary)) !important;
    font-weight: 700 !important;
}

.full-calendar-day.other-month,
.full-calendar-day.empty {
    opacity: 0.3;
    cursor: default;
}

.full-calendar-day .day-number {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 4px;
}

.full-calendar-day .day-badges {
    position: absolute;
    bottom: 2px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 3px;
}

.full-calendar-day .badge {
    min-width: 16px;
    height: 16px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 500;
    line-height: 1;
    padding: 0 4px;
    border: 1px solid rgba(var(--v-theme-surface), 0.5);
}

@media (max-width: 768px) {
  .home-view-wrapper.full-calendar-active {
    padding-bottom: 332px;
  }
  .calendar-day {
    min-width: 52px;
    height: 68px;
  }
  .day-number {
    font-size: 16px;
  }
  .orders-list-container {
    padding: 8px;
  }
  .fab-buttons {
    bottom: 70px;
    right: 16px;
  }
  .fab-create-above-calendar {
    bottom: calc(332px + 16px);
    right: 16px;
  }
  .full-calendar-section {
    height: 332px;
  }
  .full-calendar-content {
    padding: 8px 10px 0 10px;
    height: 264px;
  }
  .calendar-weeks {
    height: 226px;
  }
}
</style>