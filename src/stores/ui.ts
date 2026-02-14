import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    errorMessage: '',
  }),
  actions: {
    showError(message: string) {
      this.errorMessage = message
    },
    clearError() {
      this.errorMessage = ''
    },
  },
})
