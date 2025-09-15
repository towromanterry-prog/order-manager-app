<template>
  <div class="p-4">
    <!-- Заголовок -->
    <header style="background: linear-gradient(to right, #6b7280, #4b5563); color: white; padding: 16px; margin: -16px -16px 24px -16px; border-radius: 0 0 12px 12px;">
      <div class="flex justify-between items-center">
        <div class="flex items-center">
          <button style="padding: 8px; margin-right: 12px; background: rgba(255,255,255,0.1); border: none; border-radius: 6px; color: white;">
            <svg style="width: 24px; height: 24px; display: block;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <h1 style="font-size: 20px; font-weight: 600;">Order Manager</h1>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="display: flex; align-items: center;">
            <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; margin-right: 8px;"></div>
            <span style="font-size: 12px;">Синхронизировано</span>
          </div>
          <button style="padding: 8px; background: rgba(255,255,255,0.1); border: none; border-radius: 6px; color: white;">
            <svg style="width: 24px; height: 24px; display: block;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Календарь -->
    <div class="card mb-4" style="text-align: center;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <button @click="previousWeek" style="padding: 8px; background: #f3f4f6; border: none; border-radius: 50%; color: #6b7280;">
          <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h3 style="font-size: 16px; font-weight: 600; color: #374151;">{{ currentWeekText }}</h3>
        <button @click="nextWeek" style="padding: 8px; background: #f3f4f6; border: none; border-radius: 50%; color: #6b7280;">
          <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
      <div style="display: flex; justify-content: center; gap: 8px;">
        <button
          v-for="day in weekDays"
          :key="day.date"
          @click="selectedDate = day.date"
          :style="{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: 'none',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: day.date === selectedDate ? '#3b82f6' : '#f3f4f6',
            color: day.date === selectedDate ? 'white' : '#6b7280'
          }"
        >
          {{ day.label }}
        </button>
      </div>
    </div>

    <!-- Заказы -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <h2 class="text-lg font-bold">Заказы</h2>
      <button @click="showForm = true" class="btn btn-primary">+ Добавить</button>
    </div>

    <!-- Список заказов -->
    <div v-if="orders.length === 0" class="text-center p-4" style="color: #6b7280;">
      Заказов пока нет
    </div>

    <div v-else>
      <div v-for="order in orders" :key="order.id" class="card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <div>
            <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 4px;">{{ order.clientName }}</h3>
            <div style="display: flex; align-items: center; color: #6b7280; font-size: 14px;">
              <svg style="width: 16px; height: 16px; margin-right: 4px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              {{ order.phone }}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 20px; font-weight: bold; margin-bottom: 4px;">${{ order.totalAmount.toLocaleString() }}</div>
            <span :class="`status-${order.status.replace('_', '-')}`">{{ getStatusText(order.status) }}</span>
          </div>
        </div>

        <div style="margin-bottom: 12px;">
          <div style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">Услуги:</div>
          <div style="display: flex; flex-wrap: wrap; gap: 4px;">
            <span 
              v-for="service in order.services"
              :key="service"
              style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;"
            >
              {{ service }}
            </span>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; color: #6b7280; font-size: 14px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center;">
            <svg style="width: 16px; height: 16px; margin-right: 4px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Дедлайн: {{ formatDate(order.deadline) }}
          </div>
          <div style="font-size: 12px;">
            {{ getTimeAgo(order.createdAt) }}
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button @click="callClient(order)" style="display: flex; align-items: center; padding: 8px 12px; background: #10b981; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer;">
            <svg style="width: 16px; height: 16px; margin-right: 4px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            Позвонить
          </button>
          <button @click="shareToWhatsApp(order)" style="display: flex; align-items: center; padding: 8px 12px; background: #059669; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer;">
            <svg style="width: 16px; height: 16px; margin-right: 4px;" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.300"/>
            </svg>
            WhatsApp
          </button>
          <button @click="editOrder(order)" style="display: flex; align-items: center; padding: 8px 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer;">
            <svg style="width: 16px; height: 16px; margin-right: 4px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            Изменить
          </button>
        </div>
      </div>
    </div>

    <!-- Форма создания заказа -->
    <div v-if="showForm" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px;">
      <div style="background: white; border-radius: 12px; padding: 24px; width: 100%; max-width: 400px; max-height: 90vh; overflow-y: auto;">
        <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 16px;">{{ editingOrder ? 'Редактировать заказ' : 'Новый заказ' }}</h3>
        
        <form @submit.prevent="saveOrder" style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">Имя клиента *</label>
            <input v-model="form.clientName" type="text" placeholder="Введите имя клиента" required style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" />
          </div>
          
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">Телефон *</label>
            <input v-model="form.phone" type="tel" placeholder="+7 (999) 999-99-99" required style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" />
          </div>

          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">Услуги</label>
            <textarea v-model="form.servicesText" placeholder="Введите услуги через запятую" rows="3" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; resize: vertical;"></textarea>
          </div>
          
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">Сумма *</label>
            <input v-model="form.totalAmount" type="number" placeholder="0" required min="0" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" />
          </div>
          
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">Дедлайн *</label>
            <input v-model="form.deadline" type="date" required style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" />
          </div>

          <div v-if="editingOrder">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">Статус</label>
            <select v-model="form.status" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
              <option value="new">Новый</option>
              <option value="in_progress">В работе</option>
              <option value="completed">Выполнен</option>
              <option value="overdue">Просрочен</option>
            </select>
          </div>

          <div style="display: flex; gap: 12px; margin-top: 8px;">
            <button type="button" @click="cancelForm" style="flex: 1; padding: 10px 16px; border: 1px solid #d1d5db; border-radius: 6px; background: white; color: #374151; font-size: 14px; cursor: pointer;">
              Отмена
            </button>
            <button type="submit" style="flex: 1; padding: 10px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;">
              {{ editingOrder ? 'Обновить' : 'Создать' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const selectedDate = ref('2025-11-02')
const showForm = ref(false)
const editingOrder = ref(null)
const currentWeekStart = ref(new Date('2025-11-01'))

const orders = ref([
  {
    id: '1',
    clientName: 'Anna Chen',
    phone: '+7 (555) 123-45-67',
    services: ['Website Redesign', 'Content Creation'],
    totalAmount: 1200,
    status: 'in_progress',
    deadline: '2025-11-02',
    createdAt: '2025-09-14T20:00:00Z'
  },
  {
    id: '2', 
    clientName: 'Lusta',
    phone: '+7 (512) 745-67-89',
    services: ['Website Redesign', 'Content Creation'],
    totalAmount: 1500,
    status: 'new',
    deadline: '2025-11-02',
    createdAt: '2025-09-14T19:00:00Z'
  },
  {
    id: '3',
    clientName: 'Spent',
    phone: '+7 (557) 466-89-10',
    services: ['SEO Content Creation'],
    totalAmount: 1500,
    status: 'in_progress',
    deadline: '2025-11-02',
    createdAt: '2025-09-14T18:00:00Z'
  },
  {
    id: '4',
    clientName: 'Markus Schmidt',
    phone: '+7 (555) 987-65-43',
    services: ['Mobile App Development'],
    totalAmount: 2500,
    status: 'new',
    deadline: '2025-11-02',
    createdAt: '2025-09-14T17:00:00Z'
  },
  {
    id: '5',
    clientName: 'Lush Phen',
    phone: '+7 (555) 123-45-67',
    services: ['Website Redesign', 'Optimization'],
    totalAmount: 1800,
    status: 'completed',
    deadline: '2025-11-01',
    createdAt: '2025-09-14T16:00:00Z'
  }
])

const form = reactive({
  clientName: '',
  phone: '',
  servicesText: '',
  totalAmount: 0,
  deadline: '',
  status: 'new'
})

const weekDays = computed(() => {
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  const startDate = new Date(currentWeekStart.value)
  
  return days.map((label, index) => {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + index)
    return {
      label,
      date: date.toISOString().split('T')[0]
    }
  })
})

const currentWeekText = computed(() => {
  const endDate = new Date(currentWeekStart.value)
  endDate.setDate(endDate.getDate() + 6)
  
  const options = { day: 'numeric', month: 'short' }
  return `${currentWeekStart.value.toLocaleDateString('ru-RU', options)} - ${endDate.toLocaleDateString('ru-RU', options)}`
})

const getStatusText = (status) => {
  const statusMap = {
    new: 'Новый',
    in_progress: 'В работе', 
    completed: 'Выполнен',
    overdue: 'Просрочен'
  }
  return statusMap[status] || status
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU')
}

const getTimeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'вчера'
  if (diffDays < 7) return `${diffDays} дн. назад`
  return formatDate(dateString)
}

const previousWeek = () => {
  currentWeekStart.value.setDate(currentWeekStart.value.getDate() - 7)
}

const nextWeek = () => {
  currentWeekStart.value.setDate(currentWeekStart.value.getDate() + 7)
}

const saveOrder = () => {
  const services = form.servicesText ? form.servicesText.split(',').map(s => s.trim()).filter(s => s) : ['Консультация']
  
  if (editingOrder.value) {
    // Обновляем существующий заказ
    const index = orders.value.findIndex(o => o.id === editingOrder.value.id)
    if (index !== -1) {
      orders.value[index] = {
        ...orders.value[index],
        clientName: form.clientName,
        phone: form.phone,
        services: services,
        totalAmount: Number(form.totalAmount),
        deadline: form.deadline,
        status: form.status,
        updatedAt: new Date().toISOString()
      }
    }
  } else {
    // Создаем новый заказ
    const newOrder = {
      id: Date.now().toString(),
      clientName: form.clientName,
      phone: form.phone,
      services: services,
      totalAmount: Number(form.totalAmount),
      deadline: form.deadline,
      status: 'new',
      createdAt: new Date().toISOString()
    }
    orders.value.push(newOrder)
  }
  
  cancelForm()
}

const editOrder = (order) => {
  editingOrder.value = order
  form.clientName = order.clientName
  form.phone = order.phone
  form.servicesText = order.services.join(', ')
  form.totalAmount = order.totalAmount
  form.deadline = order.deadline
  form.status = order.status
  showForm.value = true
}

const cancelForm = () => {
  showForm.value = false
  editingOrder.value = null
  Object.assign(form, {
    clientName: '',
    phone: '',
    servicesText: '',
    totalAmount: 0,
    deadline: '',
    status: 'new'
  })
}

const callClient = (order) => {
  const phoneNumber = order.phone.replace(/[^0-9+]/g, '')
  window.location.href = `tel:${phoneNumber}`
}

const shareToWhatsApp = (order) => {
  const message = `Заказ #${order.id.slice(-4)}

👤 Клиент: ${order.clientName}
📱 Телефон: ${order.phone}
💼 Услуги: ${order.services.join(', ')}
💰 Сумма: $${order.totalAmount.toLocaleString()}
📅 Дедлайн: ${formatDate(order.deadline)}
📊 Статус: ${getStatusText(order.status)}

Спасибо за сотрудничество! 🤝`

  const phoneNumber = order.phone.replace(/[^0-9]/g, '')
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}
</script>
