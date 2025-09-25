// orderStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useOrderStore = defineStore('orders', () => {
  const orders = ref([]);

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
          status: o.status || 'in_progress',
          createDate: o.createDate || new Date().toISOString(),
          services: (o.services || []).map(s => ({
            ...s,
            status: s.status || 'in_progress'
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
    const newOrder = {
      ...orderData,
      id: Date.now().toString(),
      status: orderData.status || 'in_progress', // Используем переданный статус или по умолчанию
      createDate: new Date().toISOString(),
      services: (orderData.services || []).map(s => ({
        ...s,
        status: s.status || 'in_progress'
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
        id: originalOrder.id, // Сохраняем оригинальный ID
        createDate: originalOrder.createDate, // Сохраняем оригинальную дату создания
        status: orderData.status !== undefined ? orderData.status : originalOrder.status, // Сохраняем статус если не передан
        services: (orderData.services || originalOrder.services).map(s => ({
          ...s,
          status: s.status || 'in_progress'
        }))
      };
      _save();
    }
  }

  // Остальные функции остаются без изменений
  function deleteOrder(id) {
    const index = orders.value.findIndex(o => o.id === id);
    if (index !== -1) {
      orders.value.splice(index, 1);
      _save();
    }
  }

  function updateOrderStatus(orderId, newStatus, showConfirmation = true) {
    const order = orders.value.find(o => o.id === orderId);
    if (!order) return false;

    const oldStatus = order.status;
    
    if (showConfirmation && isStatusDowngrade(oldStatus, newStatus)) {
      return {
        needsConfirmation: true,
        message: `Вы уверены, что хотите изменить статус заказа с "${getStatusText(oldStatus)}" на "${getStatusText(newStatus)}"? Статусы услуг не изменятся.`,
        onConfirm: () => updateOrderStatus(orderId, newStatus, false)
      };
    }

    order.status = newStatus;

    if (isStatusUpgrade(oldStatus, newStatus)) {
      const targetServiceStatus = newStatus === 'delivered' ? 'completed' : newStatus;
      order.services.forEach(service => {
        if (targetServiceStatus === 'completed' || service.status !== 'completed') {
          service.status = targetServiceStatus === 'delivered' ? 'completed' : targetServiceStatus;
        }
      });
    }

    _save();
    return { success: true };
  }

  function updateServiceStatus(orderId, serviceIndex, newStatus) {
    const order = orders.value.find(o => o.id === orderId);
    if (!order || !order.services[serviceIndex]) return;

    order.services[serviceIndex].status = newStatus;
    
    const allCompleted = order.services.every(s => s.status === 'completed');
    if (allCompleted && order.status === 'in_progress') {
      order.status = 'completed';
    }
    
    const hasInProgress = order.services.some(s => s.status === 'in_progress');
    if (hasInProgress && order.status === 'completed') {
      order.status = 'in_progress';
    }

    _save();
  }

  function isStatusUpgrade(oldStatus, newStatus) {
    const statusOrder = ['in_progress', 'completed', 'delivered'];
    const oldIndex = statusOrder.indexOf(oldStatus);
    const newIndex = statusOrder.indexOf(newStatus);
    return newIndex > oldIndex;
  }

  function isStatusDowngrade(oldStatus, newStatus) {
    const statusOrder = ['in_progress', 'completed', 'delivered'];
    const oldIndex = statusOrder.indexOf(oldStatus);
    const newIndex = statusOrder.indexOf(newStatus);
    return newIndex < oldIndex;
  }

  function getStatusText(status) {
    const statusMap = {
      in_progress: 'В работе',
      completed: 'Выполнено',
      delivered: 'Сдан',
      cancelled: 'Отменен'
    };
    return statusMap[status] || status;
  }

  function cycleOrderStatus(orderId) {
    const order = orders.value.find(o => o.id === orderId);
    if (!order) return;

    const statusCycle = {
      'in_progress': 'completed',
      'completed': 'delivered',
      'delivered': 'in_progress',
      'cancelled': 'in_progress'
    };

    const newStatus = statusCycle[order.status];
    return updateOrderStatus(orderId, newStatus);
  }

  function updateServicePricesInActiveOrders(serviceId, newPrice) {
    orders.value.forEach(order => {
      if (order.status === 'in_progress') {
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
    return {
      total: orders.value.length,
      inProgress: orders.value.filter(o => o.status === 'in_progress').length,
      completed: orders.value.filter(o => o.status === 'completed').length,
      delivered: orders.value.filter(o => o.status === 'delivered').length,
      cancelled: orders.value.filter(o => o.status === 'cancelled').length
    };
  }

  return {
    orders,
    load: _load,
    _load,
    addOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    updateServiceStatus,
    cycleOrderStatus,
    updateServicePricesInActiveOrders,
    getOrderById,
    ordersByDate,
    ordersByStatus,
    getOrderStats
  };
});