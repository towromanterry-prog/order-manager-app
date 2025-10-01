// settingsStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
  const requiredFields = ref({
    clientName: true,
    phone: true,
    services: true,
    deadline: false,
    notes: false
  });
  
  const appSettings = ref({
    enableHapticFeedback: true,
    enablePullToRefresh: true,
    defaultOrderStatus: 'in_progress',
    autoSaveFormDrafts: true,
    showCompletedOrders: true,
    compactMode: false
  });
  
  function loadSettings() {
    // Загрузка обязательных полей с обработкой ошибок
    try {
      const storedRequired = localStorage.getItem('requiredFields');
      if (storedRequired) {
        const parsed = JSON.parse(storedRequired);
        if (typeof parsed === 'object' && parsed !== null) {
          requiredFields.value = { ...requiredFields.value, ...parsed };
        } else {
          throw new Error('Stored requiredFields is not an object');
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки requiredFields из localStorage:', error);
      localStorage.removeItem('requiredFields');
    }
    
    // Загрузка настроек приложения с обработкой ошибок
    try {
      const storedSettings = localStorage.getItem('appSettings');
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        if (typeof parsed === 'object' && parsed !== null) {
          appSettings.value = { ...appSettings.value, ...parsed };
        } else {
          throw new Error('Stored appSettings is not an object');
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки appSettings из localStorage:', error);
      localStorage.removeItem('appSettings');
    }
  }
  
  function updateRequiredFields(fields) {
    requiredFields.value = { ...requiredFields.value, ...fields };
    localStorage.setItem('requiredFields', JSON.stringify(requiredFields.value));
  }
  
  function updateAppSettings(settings) {
    appSettings.value = { ...appSettings.value, ...settings };
    localStorage.setItem('appSettings', JSON.stringify(appSettings.value));
  }
  
  function resetSettings() {
    requiredFields.value = {
      clientName: true,
      phone: true,
      services: true,
      deadline: false,
      notes: false
    };
    
    appSettings.value = {
      enableHapticFeedback: true,
      enablePullToRefresh: true,
      defaultOrderStatus: 'in_progress',
      autoSaveFormDrafts: true,
      showCompletedOrders: true,
      compactMode: false
    };
    
    localStorage.removeItem('requiredFields');
    localStorage.removeItem('appSettings');
  }
  
  function isFieldRequired(fieldName) {
    return requiredFields.value[fieldName] || false;
  }
  
  return {
    requiredFields,
    appSettings,
    loadSettings,
    updateRequiredFields,
    updateAppSettings,
    resetSettings,
    isFieldRequired
  };
});