<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useUiStore } from './stores/ui'

const uiStore = useUiStore()
</script>

<template>
  <RouterView />

  <div v-if="uiStore.errorMessage" class="toast-backdrop">
    <div class="toast-card">
      <div>
        <h3>Something went wrong</h3>
        <p>{{ uiStore.errorMessage }}</p>
      </div>
      <button class="primary-button" type="button" @click="uiStore.clearError()">Dismiss</button>
    </div>
  </div>
</template>

<style scoped>
.toast-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 24px;
  background: rgba(15, 23, 42, 0.3);
  z-index: 30;
}

.toast-card {
  display: flex;
  align-items: center;
  gap: 24px;
  background: #fff;
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
  width: min(520px, 90vw);
}

.toast-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
}

.toast-card p {
  color: #475569;
  font-size: 0.9rem;
}
</style>
