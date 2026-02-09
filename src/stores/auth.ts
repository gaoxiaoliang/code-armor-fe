import { defineStore } from 'pinia'

type UserProfile = {
  email?: string
  username?: string
}

const TOKEN_KEY = 'code-armor-token'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) ?? '',
    user: null as UserProfile | null,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    setToken(token: string) {
      this.token = token
      localStorage.setItem(TOKEN_KEY, token)
    },
    clearToken() {
      this.token = ''
      this.user = null
      localStorage.removeItem(TOKEN_KEY)
    },
    setUser(user: UserProfile | null) {
      this.user = user
    },
  },
})
