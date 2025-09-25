<template>
  <v-app>
    <!-- Боковая панель навигации -->
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item
          v-for="(item, index) in menuItems"
          :key="index"
          @click="goToRoute(item.route)"
        >
          <template v-slot:prepend>
            <v-icon :icon="item.icon"></v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Хедер -->
    <v-app-bar app color="primary" dark height="68">
      
      <!-- Поле поиска -->
      <v-text-field
        v-model="searchQuery"
        placeholder="Поиск..."
        variant="solo"
        bg-color="secondary"
        dense
        hide-details
        flat
        class="full-width-search"
      >
        <!-- ИСПРАВЛЕНО: Возвращаем слот для полного контроля над событиями -->
        <template v-slot:prepend-inner>
          <v-icon
            icon="mdi-menu"
            class="burger-icon"
            @mousedown.stop
            @mouseup.stop
            @click.stop="drawer = !drawer"
          ></v-icon>
        </template>
      </v-text-field>

    </v-app-bar>

    <!-- Основной контент -->
    <v-main class="app-main">
      <router-view />
    </v-main>

    <!-- Диалоговое окно подтверждения -->
    <ConfirmationDialog />
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// ✅ ИСПРАВЛЕННЫЕ ИМПОРТЫ STORES - добавлены правильные пути
import { useThemeStore } from '@/stores/themeStore.js';
import { useServiceStore } from '@/stores/serviceStore.js';
import { useOrderStore } from '@/stores/orderStore.js';
import { useClientsStore } from '@/stores/clientsStore.js';
import { useSettingsStore } from '@/stores/settingsStore.js';
import { useTagsStore } from '@/stores/tagsStore.js';

// ✅ ИСПРАВЛЕННЫЙ ИМПОРТ КОМПОНЕНТА
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue';

const router = useRouter();
const searchQuery = ref('');
const drawer = ref(false);

const menuItems = ref([
  { title: 'Главная', icon: 'mdi-home', route: 'home' },
  { title: 'Клиенты', icon: 'mdi-account-group', route: 'clients' },
  { title: 'Базовые настройки', icon: 'mdi-cog-outline', route: 'base-settings' },
  { title: 'Настройки', icon: 'mdi-tune', route: 'settings' }
]);

// ✅ ИНИЦИАЛИЗАЦИЯ STORES - добавлен отсутствующий tagsStore
const themeStore = useThemeStore();
const serviceStore = useServiceStore();
const orderStore = useOrderStore();
const clientsStore = useClientsStore();
const settingsStore = useSettingsStore();
const tagsStore = useTagsStore(); // ✅ ДОБАВЛЕНО - было отсутствующее

const goToRoute = (routeName) => {
  router.push({ name: routeName });
  drawer.value = false;
};

const initializeApp = async () => {
  try {
    // ✅ ИСПРАВЛЕНО: Добавлены проверки на существование функций
    if (settingsStore.loadSettings) await settingsStore.loadSettings();
    if (themeStore.loadTheme) await themeStore.loadTheme();
    if (serviceStore.loadServices) await serviceStore.loadServices();
    if (clientsStore.loadClients) await clientsStore.loadClients();
    if (tagsStore.loadTags) await tagsStore.loadTags(); // ✅ ДОБАВЛЕНО
    
    // ✅ ВКЛЮЧЕНО ОБРАТНО - теперь должно работать после наших исправлений
    if (orderStore.load) await orderStore.load();

  } catch (error) {
    console.error('Ошибка инициализации приложения:', error);
  }
};

onMounted(initializeApp);
</script>

<style scoped>
.app-main {
  padding-bottom: 0;
}

:deep(.v-toolbar__content) {
  display: flex;
  align-items: center;
  padding: 0 8px !important;
}

.full-width-search {
  margin: 0 !important;
}

.burger-icon {
  cursor: pointer;
  margin-right: 12px;
}
</style>