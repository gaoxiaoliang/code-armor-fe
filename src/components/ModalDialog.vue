<script setup lang="ts">
type Props = {
  title: string
  isOpen: boolean
}

defineProps<Props>()
defineEmits<{ (event: 'close'): void }>()
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" role="dialog" aria-modal="true">
    <div class="modal-card">
      <div class="modal-header">
        <h2>{{ title }}</h2>
        <button class="ghost-button" type="button" aria-label="Close" @click="$emit('close')">
          ✕
        </button>
      </div>
      <div class="modal-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.modal-card {
  width: min(480px, 90vw);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.25);
  padding: 24px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
}

.modal-body {
  display: grid;
  gap: 16px;
}
</style>
