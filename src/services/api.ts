import router from '../router'
import pinia from '../stores/pinia'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

type ApiError = {
  code?: string
  message?: string
}

type RequestOptions = RequestInit

const buildHeaders = (options: RequestOptions, token?: string) => {
  const headers = new Headers(options.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return headers
}

const parseError = async (response: Response) => {
  try {
    return (await response.json()) as ApiError
  } catch {
    return { message: 'Unexpected error response.' } as ApiError
  }
}

export const apiRequest = async <T>(path: string, options: RequestOptions = {}) => {
  const authStore = useAuthStore(pinia)
  const uiStore = useUiStore(pinia)

  const headers = buildHeaders(options, authStore.token || undefined)
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await parseError(response)
    const message = error.message || 'Request failed. Please try again.'
    uiStore.showError(message)

    if (error.code === 'UNAUTHORIZED') {
      authStore.clearToken()
      if (router.currentRoute.value.path !== '/') {
        await router.push('/')
      }
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return null as T
  }

  const contentType = response.headers.get('Content-Type')
  if (contentType && contentType.includes('application/json')) {
    return (await response.json()) as T
  }

  return (await response.text()) as T
}
