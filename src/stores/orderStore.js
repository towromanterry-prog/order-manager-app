// orderStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useSettingsStore } from './settingsStore';
import { useConfirmationStore } from './confirmationStore';

const ORDER_STATUS_FLOW = ['accepted', 'additional', 'in_progress', 'completed', 'delivered'];
const SERVICE_STATUS_FLOW = ['accepted', 'additional', 'in_progress', 'completed'];

export const useOrderStore = defineStore('orders', () => {
  const orders = ref([]);
  const cancellationCache = new Map();

  function _save() {
    localStorage.setItem('orders', JSON.stringify(orders.value));
  }

  function _load() {
    try {
      const stored = localStorage.getItem('orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          orders.value = parsed.map(o => ({
            ...o,
            status: o.status || 'accepted',
            createDate: o.createDate || new Date().toISOString(),
            services: (o.services || []).map(s => ({
              ...s,
              status: s.status || 'accepted'
            }))
          }));
        } else {
          throw new Error('Stored orders is not an array');
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки orders из localStorage:', error);
      orders.value = [];
      localStorage.removeItem('orders');
    }
  }

  const getOrderById = computed(() => id =>
    orders.value.find(o => o.id === id)
  );

  function addOrder(orderData) {
    const settingsStore = useSettingsStore();
    const newOrder = {
      ...orderData,
      id: Date.now().toString(),
      status: settingsStore.appSettings.defaultOrderStatus || 'accepted',
      createDate: new Date().toISOString(),
      services: (orderData.services || []).map(s => ({
        ...s,
        status: settingsStore.appSettings.defaultOrderStatus || 'accepted'
      }))
    };
    
    orders.value.push(newOrder);
    _save();
    return newOrder;
  }

  function updateOrder(id, orderData) {
    const index = orders.value.findIndex(o => o.id === id);
    if (index !== -1) {
      const originalOrder = orders.value[index];
      orders.value[index] = {
        ...originalOrder,
        ...orderData,
        id: originalOrder.id,
        createDate: originalOrder.createDate,
        status: orderData.status !== undefined ? orderData.status : originalOrder.status,
        services: (orderData.services || originalOrder.services).map(s => ({
          ...s,
          status: s.status || 'accepted'
        }))
      };
      _save();
    }
  }

  function deleteOrder(id) {
    const index = orders.value.findIndex(o => o.id === id);
    if (index !== -1) {
      orders.value.splice(index, 1);
      _save();
    }
  }

  function getStatusText(status) {
    const settingsStore = useSettingsStore();
    const statusMap = {
      accepted: 'Принят',
      additional: settingsStore.appSettings.additionalStatusName || 'Доп. статус',
      in_progress: 'В работе',
      completed: 'Выполнено',
      delivered: 'Сдан',
      cancelled: 'Отменен'
    };
    return statusMap[status] || status;
  }

  function _syncOrderStatusFromServices(order) {
    const settingsStore = useSettingsStore();
    const syncSettings = settingsStore.appSettings.syncServiceToOrderStatus;
    const orderStatusSettings = settingsStore.appSettings.orderStatuses;

    if (!order.services || order.services.length === 0) return;

    const serviceStatuses = order.services.map(s => s.status);

    // Rule 1: If ALL services are 'completed', the order becomes 'completed'.
    if (syncSettings.completed && orderStatusSettings.completed && serviceStatuses.every(s => s === 'completed')) {
      if (order.status !== 'completed') order.status = 'completed';
      return;
    }
    
    // Rule 2: If there's at least one 'in_progress', the order becomes 'in_progress'.
    if (syncSettings.in_progress && orderStatusSettings.in_progress && serviceStatuses.includes('in_progress')) {
        if(order.status !== 'in_progress') order.status = 'in_progress';
        return;
    }

    // Rule 3: If there's at least one 'additional', and none are 'in_progress', order becomes 'additional'.
    if (syncSettings.additional && orderStatusSettings.additional && serviceStatuses.includes('additional') && !serviceStatuses.includes('in_progress')) {
        if (order.status !== 'additional') order.status = 'additional';
        return;
    }
  }

  async function _syncServicesStatusFromOrder(order, newStatus) {
    const settingsStore = useSettingsStore();
    const confirmationStore = useConfirmationStore();

    const syncMode = settingsStore.appSettings.syncOrderToServiceStatus;
    if (syncMode === 'none' || !SERVICE_STATUS_FLOW.includes(newStatus)) {
        return;
    }

    let applyToServices = true;
    if (syncMode === 'confirm') {
        applyToServices = await confirmationStore.open(
            'Синхронизация статусов',
            `Изменить статус всех услуг на "${getStatusText(newStatus)}"?`
        );
    }

    if (applyToServices) {
        order.services.forEach(s => {
            if (SERVICE_STATUS_FLOW.includes(newStatus)) {
                s.status = newStatus;
            }
        });
    }
  }

  async function updateStatus(orderId, newStatus, isService = false, serviceIndex = -1) {
    const order = orders.value.find(o => o.id === orderId);
    if (!order) return;

    const confirmationStore = useConfirmationStore();
    
    const flow = isService ? SERVICE_STATUS_FLOW : ORDER_STATUS_FLOW;
    
    const oldStatus = isService ? order.services[serviceIndex].status : order.status;
    const oldIndex = flow.indexOf(oldStatus);
    const newIndex = flow.indexOf(newStatus);

    if (newIndex < oldIndex && oldStatus !== 'cancelled') {
      const confirmed = await confirmationStore.open(
        'Понижение статуса',
        `Вы уверены, что хотите изменить статус с "${getStatusText(oldStatus)}" на "${getStatusText(newStatus)}"?`
      );
      if (!confirmed) return;
    }

    // Update the primary status (order or service)
    if (isService) {
      order.services[serviceIndex].status = newStatus;
      _syncOrderStatusFromServices(order);
    } else {
      order.status = newStatus;
      await _syncServicesStatusFromOrder(order, newStatus);
    }

    _save();
  }

  function calculateNextStatus(currentStatus, isService = false) {
    const settingsStore = useSettingsStore();
    const flow = isService ? SERVICE_STATUS_FLOW : ORDER_STATUS_FLOW;
    const activeStatuses = isService ? settingsStore.appSettings.serviceStatuses : settingsStore.appSettings.orderStatuses;

    const currentIndex = flow.indexOf(currentStatus);

    if (currentIndex === -1 || currentIndex === flow.length - 1) {
      return currentStatus;
    }

    for (let i = currentIndex + 1; i < flow.length; i++) {
      const nextStatus = flow[i];
      if (activeStatuses[nextStatus]) {
        return nextStatus;
      }
    }
    return currentStatus;
  }

  async function cancelOrder(orderId) {
    const order = orders.value.find(o => o.id === orderId);
    if (!order) return;
    const confirmationStore = useConfirmationStore();

    const confirmed = await confirmationStore.open('Отмена заказа', 'Вы уверены, что хотите отменить этот заказ?');
    if (!confirmed) return;

    // Cache the original statuses
    cancellationCache.set(orderId, {
      orderStatus: order.status,
      serviceStatuses: order.services.map(s => s.status)
    });

    order.status = 'cancelled';
    order.services.forEach(s => s.status = 'cancelled');
    _save();
  }

  async function undoCancelOrder(orderId) {
    const order = orders.value.find(o => o.id === orderId);
    if (!order || order.status !== 'cancelled') return;

    const cachedState = cancellationCache.get(orderId);
    if (!cachedState) return;

    const confirmationStore = useConfirmationStore();
    const confirmed = await confirmationStore.open('Восстановление заказа', 'Вы уверены, что хотите восстановить этот заказ?');
    if (!confirmed) return;

    order.status = cachedState.orderStatus;
    order.services.forEach((service, index) => {
        service.status = cachedState.serviceStatuses[index] || 'accepted';
    });

    cancellationCache.delete(orderId);
    _save();
  }

  function updateServicePricesInActiveOrders(serviceId, newPrice) {
    orders.value.forEach(order => {
      if (['accepted', 'additional', 'in_progress'].includes(order.status)) {
        order.services.forEach(service => {
          if (service.id === serviceId) {
            service.price = newPrice;
          }
        });
      }
    });
    _save();
  }

  const ordersByDate = computed(() => (date) => {
    return orders.value.filter(order => {
      const orderDate = new Date(order.deadline || order.createDate);
      const targetDate = new Date(date);
      return orderDate.toDateString() === targetDate.toDateString();
    });
  });

  const ordersByStatus = computed(() => (status) => {
    return orders.value.filter(order => order.status === status);
  });

  function getOrderStats() {
    const stats = {
      total: orders.value.length,
      accepted: 0,
      additional: 0,
      in_progress: 0,
      completed: 0,
      delivered: 0,
      cancelled: 0,
    };
    orders.value.forEach(o => {
        if (stats[o.status] !== undefined) {
            stats[o.status]++;
        }
    });
    return stats;
  }

  return {
    orders,
    load: _load,
    _load,
    addOrder,
    updateOrder,
    deleteOrder,
    updateStatus,
    calculateNextStatus,
    cancelOrder,
    undoCancelOrder,
    updateServicePricesInActiveOrders,
    getOrderById,
    ordersByDate,
    ordersByStatus,
    getOrderStats,
    getStatusText
  };
});