<template>
  <v-card
    class="mb-1 pa-3"
    style="min-height: 100px; display: flex; flex-direction: column; justify-content: space-between;"
    v-ripple="{disabled: true}"
    @click="expanded = !expanded"
  >
    <v-card-text
      style="flex-grow: 1; padding-bottom: 24px; overflow: visible; cursor: pointer; display: flex; justify-content: space-between;"
    >
      <div style="flex-grow: 1; min-width: 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <p class="font-weight-bold text-body-1" style="text-overflow: ellipsis; overflow: hidden; margin: 0;">
            {{ order.clientName }}
          </p>
          <div @click.stop="cycleOrderStatus" style="cursor: pointer; margin-left: 12px;">
            <StatusIndicator :status="order.status" />
          </div>
        </div>
        <p class="text-body-2 text-medium-emphasis" style="margin-bottom: 8px; font-size: 1.1rem;">{{ order.phone }}</p>
        <p class="text-caption text-medium-emphasis" v-if="servicesPreview">{{ servicesPreview }}</p>
      </div>
    </v-card-text>

    <div style="display: flex; justify-content: flex-end; padding: 0 8px 8px 0;">
      <div class="contact-icons" style="display: flex; gap: 8px;">
        <v-btn icon small variant="text" :href="`tel:${order.phone}`" @click.stop>
          <v-icon size="18">mdi-phone</v-icon>
        </v-btn>
        <v-btn icon small variant="text" :href="`sms:${order.phone}`" @click.stop>
          <v-icon size="18">mdi-message-text</v-icon>
        </v-btn>
        <v-btn icon small variant="text" :href="`https://wa.me/${order.phone}`" target="_blank" @click.stop>
          <v-icon size="18">mdi-whatsapp</v-icon>
        </v-btn>
      </div>
    </div>

    <v-fade-transition mode="out-in" :duration="{ enter: 150, leave: 150 }">
      <div v-show="expanded" style="padding-bottom: 8px;">
        <v-list dense class="py-0">
          <v-list-subheader>Услуги</v-list-subheader>
          <v-list-item
            v-for="service in order.services"
            :key="service.id"
            class="text-body-2"
            style="padding-top: 4px; padding-bottom: 4px;"
          >
            <v-list-item-title>{{ service.name }}</v-list-item-title>
            <template v-slot:append>
              <span class="font-weight-medium mr-4">{{ service.price }} ₽</span>
              <div @click.stop>
                <StatusIndicator
                  :status="service.status"
                  @click.stop="toggleServiceStatus(service)"
                  style="cursor: pointer;"
                />
              </div>
            </template>
          </v-list-item>
        </v-list>

        <div class="d-flex justify-space-between align-center pa-4" style="padding-top: 8px; padding-bottom: 8px;">
          <span class="font-weight-medium text-body-1">Итого:</span>
          <span class="font-weight-bold text-h6 text-primary">{{ order.totalAmount }} ₽</span>
        </div>

        <v-card-actions class="justify-end" style="padding-top: 4px; padding-bottom: 4px;">
          <v-btn variant="text" @click.stop="$emit('delete', order)">Удалить</v-btn>
          <v-btn color="primary" variant="tonal" @click.stop="$emit('edit', order)">Редактировать</v-btn>
        </v-card-actions>
      </div>
    </v-fade-transition>
  </v-card>
</template>

<script setup>
import { ref, computed } from "vue";
import StatusIndicator from "../common/StatusIndicator.vue";
import { useOrderStore } from "@/stores/orderStore.js";
import { useConfirmationStore } from "@/stores/confirmationStore.js";

const props = defineProps({
  order: { type: Object, required: true },
});
defineEmits(["edit", "delete"]);

const orderStore = useOrderStore();
const confirmationStore = useConfirmationStore();
const expanded = ref(false);

const servicesPreview = computed(() =>
  props.order.services?.map((s) => s.name).join(", ")
);

async function toggleServiceStatus(service) {
  const newStatus = service.status === "in_progress" ? "completed" : "in_progress";
  let doChange = true;
  if (newStatus === "in_progress") {
    doChange = await confirmationStore.open(
      "Вернуть в работу?",
      `Вернуть услугу "${service.name}" в статус "В работе"?`
    );
  }
  if (doChange) {
    orderStore.setServiceStatus(props.order.id, service.id, newStatus);
  }
}

async function cycleOrderStatus() {
  const currentStatus = props.order.status;
  let nextStatus = currentStatus;
  let doChange = true;

  if (currentStatus === "in_progress") {
    nextStatus = "completed";
  } else if (currentStatus === "completed") {
    nextStatus = "delivered";
  } else if (currentStatus === "delivered") {
    nextStatus = "completed";
    doChange = await confirmationStore.open(
      'Вернуть из "Сдан"?',
      'Вы уверены, что хотите вернуть заказ в статус "Выполнен"?'
    );
  }

  if (doChange) {
    orderStore.setOrderStatus(props.order.id, nextStatus);
  }
}
</script>