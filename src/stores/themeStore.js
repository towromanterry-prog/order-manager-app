// stores/themeStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

// Упрощенные темы без сложных зависимостей
const themes = {
  blue: {
    name: 'Синяя',
    emoji: '🔵',
    colors: {
      primary: '#1E88E5',
      secondary: '#42A5F5',
      background: '#FFFFFF',
      surface: '#FAFAFA',
      onPrimary: '#FFFFFF',
      onSurface: '#000000'
    }
  },
  green: {
    name: 'Зеленая',
    emoji: '🟢',
    colors: {
      primary: '#43A047',
      secondary: '#66BB6A',
      background: '#FFFFFF',
      surface: '#F5F9F5',
      onPrimary: '#FFFFFF',
      onSurface: '#000000'
    }
  },
  orange: {
    name: 'Оранжевая',
    emoji: '🟠',
    colors: {
      primary: '#FF7043',
      secondary: '#FF8A65',
      background: '#FFFFFF',
      surface: '#FFF5F2',
      onPrimary: '#FFFFFF',
      onSurface: '#000000'
    }
  },
  purple: {
    name: 'Фиолетовая',
    emoji: '🟣',
    colors: {
      primary: '#8E24AA',
      secondary: '#AB47BC',
      background: '#FFFFFF',
      surface: '#F9F5FA',
      onPrimary: '#FFFFFF',
      onSurface: '#000000'
    }
  }
};

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref('blue');
  
  // Загрузка темы из localStorage
  function loadTheme() {
    try {
      const stored = localStorage.getItem('currentTheme');
      if (stored && themes[stored]) {
        currentTheme.value = stored;
      }
      applyThemeToDocument();
    } catch (error) {
      console.error('Ошибка загрузки темы:', error);
      currentTheme.value = 'blue';
      applyThemeToDocument();
    }
  }
  
  // Установка новой темы
  function setTheme(themeKey) {
    if (themes[themeKey]) {
      currentTheme.value = themeKey;
      try {
        localStorage.setItem('currentTheme', themeKey);
      } catch (error) {
        console.error('Ошибка сохранения темы:', error);
      }
      applyThemeToDocument();
    } else {
      console.warn(`Тема "${themeKey}" не найдена`);
    }
  }
  
  // Применение темы к CSS переменным
  function applyThemeToDocument() {
    const theme = themes[currentTheme.value];
    if (!theme) return;
    
    try {
      const root = document.documentElement;
      
      // Применяем основные цвета
      Object.entries(theme.colors).forEach(([key, value]) => {
        const cssVar = `--v-theme-${key}`;
        root.style.setProperty(cssVar, value);
      });
      
      console.log('✅ Тема применена:', currentTheme.value);
      
    } catch (error) {
      console.error('Ошибка применения темы:', error);
    }
  }
  
  // Получение списка всех доступных тем
  function getThemesList() {
    return Object.entries(themes).map(([key, theme]) => ({
      key,
      name: theme.name,
      emoji: theme.emoji,
      colors: theme.colors
    }));
  }
  
  // Получение цветов текущей темы
  function getCurrentThemeColors() {
    return themes[currentTheme.value]?.colors || themes.blue.colors;
  }
  
  // Проверка существования темы
  function themeExists(themeKey) {
    return !!themes[themeKey];
  }
  
  // Сброс темы к значению по умолчанию
  function resetTheme() {
    setTheme('blue');
  }
  
  return {
    currentTheme,
    loadTheme,
    setTheme,
    applyThemeToDocument,
    getThemesList,
    getCurrentThemeColors,
    themeExists,
    resetTheme
  };
});