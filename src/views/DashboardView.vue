<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { apiRequest } from '../services/api'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'

type AppDto = {
  id?: number
  fileName: string
  size: number
  appType: string
  status: string
  siteURL?: string
  uploadedAt?: string
}

type PagedResponse<T> = {
  data: T[]
  total: number
}

const authStore = useAuthStore()
const uiStore = useUiStore()

const isUploading = ref(false)
const isLoading = ref(false)
const apps = ref<AppDto[]>([])
const pageNo = ref(1)
const pageSize = ref(6)
const total = ref(0)
const showMenu = ref(false)
const editingUsername = ref(false)
const tempUsername = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

const fetchProfile = async () => {
  try {
    const profile = await apiRequest<Record<string, string>>('/api/user/me')
    authStore.setUser({
      email: profile?.email,
      username: profile?.username,
    })
    tempUsername.value = profile?.username ?? ''
  } catch {
    authStore.setUser(null)
  }
}

const fetchApps = async () => {
  isLoading.value = true
  try {
    const response = await apiRequest<PagedResponse<AppDto>>(
      `/api/app?pageNo=${pageNo.value}&pageSize=${pageSize.value}`,
    )
    apps.value = response?.data ?? []
    total.value = response?.total ?? 0
  } finally {
    isLoading.value = false
  }
}

const uploadFile = async (file: File) => {
  if (!file) return
  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    await apiRequest('/api/app', {
      method: 'POST',
      body: formData,
    })
    await fetchApps()
  } finally {
    isUploading.value = false
  }
}

const handleDrop = async (event: DragEvent) => {
  event.preventDefault()
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    await uploadFile(file)
  }
}

const handleBrowse = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    await uploadFile(file)
  }
  target.value = ''
}

const removeApp = async (app: AppDto) => {
  if (!app.id) {
    uiStore.showError('Delete is unavailable because the file id is missing.')
    return
  }
  await apiRequest(`/api/app/${app.id}`, { method: 'DELETE' })
  await fetchApps()
}

const formatBytes = (size: number) => {
  if (!size && size !== 0) return '-'
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  let value = size
  while (value > 1024 && index < units.length - 1) {
    value /= 1024
    index += 1
  }
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
}

const formatDate = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

const signOut = () => {
  authStore.clearToken()
  window.location.href = '/'
}

const updateUsername = async () => {
  if (!tempUsername.value) return
  editingUsername.value = false
  try {
    await apiRequest('/api/user/me', {
      method: 'PUT',
      body: JSON.stringify({ username: tempUsername.value }),
    })
    await fetchProfile()
  } catch {
    editingUsername.value = true
  }
}

const goToPage = async (nextPage: number) => {
  pageNo.value = Math.min(Math.max(nextPage, 1), totalPages.value)
  await fetchApps()
}

onMounted(async () => {
  await Promise.all([fetchProfile(), fetchApps()])
})
</script>

<template>
  <div class="page dashboard">
    <header class="dashboard-header">
      <div class="container header-content">
        <div class="logo">
          <span class="logo-mark">CA</span>
          <div>
            <p class="logo-title">Code Armor</p>
            <span class="logo-subtitle">Deployment console</span>
          </div>
        </div>
        <div class="user-menu">
          <button class="ghost-button user-button" type="button" @click="showMenu = !showMenu">
            {{ authStore.user?.username || authStore.user?.email || 'My Account' }}
            <span class="caret">▾</span>
          </button>
          <div v-if="showMenu" class="menu-card">
            <div class="menu-section">
              <p class="menu-label">Signed in as</p>
              <p class="menu-value">{{ authStore.user?.email || 'Unknown user' }}</p>
            </div>
            <div class="menu-section">
              <p class="menu-label">Username</p>
              <div class="username-editor">
                <input
                  v-model="tempUsername"
                  type="text"
                  :disabled="!editingUsername"
                  placeholder="Set a username"
                />
                <button
                  class="ghost-button"
                  type="button"
                  @click="editingUsername ? updateUsername() : (editingUsername = true)"
                >
                  {{ editingUsername ? 'Save' : 'Edit' }}
                </button>
              </div>
            </div>
            <button class="secondary-button" type="button" @click="signOut">Sign out</button>
          </div>
        </div>
      </div>
    </header>

    <main class="container dashboard-main">
      <section class="upload-card">
        <div class="upload-area" @dragover.prevent @drop="handleDrop">
          <div>
            <h2>Upload your project package</h2>
            <p>
              Drag &amp; drop a zip file here, or click to browse. We will detect, build, and
              deploy your front-end.
            </p>
          </div>
          <label class="primary-button file-button">
            {{ isUploading ? 'Uploading...' : 'Select file' }}
            <input type="file" accept=".zip" @change="handleBrowse" :disabled="isUploading" />
          </label>
        </div>
      </section>

      <section class="list-card">
        <div class="list-header">
          <div>
            <h2>Your uploads</h2>
            <p>Track the build and deployment status of every upload.</p>
          </div>
          <div class="pagination">
            <button
              class="ghost-button"
              type="button"
              :disabled="pageNo === 1"
              @click="goToPage(pageNo - 1)"
            >
              Previous
            </button>
            <span>Page {{ pageNo }} of {{ totalPages }}</span>
            <button
              class="ghost-button"
              type="button"
              :disabled="pageNo === totalPages"
              @click="goToPage(pageNo + 1)"
            >
              Next
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="empty-state">Loading uploads...</div>
        <div v-else-if="apps.length === 0" class="empty-state">
          No uploads yet. Send your first project to get started.
        </div>
        <div v-else class="table">
          <div class="table-row table-head">
            <span>File</span>
            <span>Size</span>
            <span>Framework</span>
            <span>Status</span>
            <span>Site URL</span>
            <span>Uploaded</span>
            <span>Actions</span>
          </div>
          <div v-for="app in apps" :key="app.id || app.fileName" class="table-row">
            <span>{{ app.fileName }}</span>
            <span>{{ formatBytes(app.size) }}</span>
            <span>{{ app.appType }}</span>
            <span>{{ app.status }}</span>
            <span>
              <a v-if="app.siteURL" :href="app.siteURL" target="_blank" rel="noreferrer">
                Open
              </a>
              <span v-else>-</span>
            </span>
            <span>{{ formatDate(app.uploadedAt) }}</span>
            <span>
              <button class="ghost-button" type="button" @click="removeApp(app)">Delete</button>
            </span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.dashboard {
  background: #f8fafc;
}

.dashboard-header {
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-mark {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: #2563eb;
  color: #fff;
  font-weight: 700;
  display: grid;
  place-items: center;
}

.logo-title {
  font-weight: 700;
}

.logo-subtitle {
  font-size: 0.8rem;
  color: #64748b;
}

.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.caret {
  font-size: 0.75rem;
}

.menu-card {
  position: absolute;
  right: 0;
  top: 44px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  width: min(280px, 80vw);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);
  display: grid;
  gap: 12px;
}

.menu-section {
  display: grid;
  gap: 6px;
}

.menu-label {
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 1px;
  color: #94a3b8;
}

.menu-value {
  font-weight: 600;
}

.username-editor {
  display: flex;
  gap: 8px;
  align-items: center;
}

.username-editor input {
  flex: 1;
  border-radius: 10px;
  border: 1px solid #cbd5f5;
  padding: 8px 10px;
}

.dashboard-main {
  display: grid;
  gap: 24px;
  padding: 32px 0 80px;
}

.upload-card,
.list-card {
  background: #fff;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
}

.upload-area {
  border: 2px dashed #cbd5f5;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: #f8fafc;
}

.upload-area h2 {
  font-size: 1.4rem;
  margin-bottom: 8px;
}

.upload-area p {
  color: #64748b;
}

.file-button input {
  display: none;
}

.list-header {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #64748b;
}

.table {
  display: grid;
  gap: 12px;
}

.table-row {
  display: grid;
  grid-template-columns: 1.5fr 0.6fr 0.8fr 1fr 1fr 1fr 0.6fr;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 14px;
  background: #f8fafc;
  font-size: 0.92rem;
}

.table-head {
  background: #e2e8f0;
  font-weight: 600;
}

.table-row a {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}

.empty-state {
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  color: #64748b;
}

@media (max-width: 900px) {
  .table-row {
    grid-template-columns: 1fr;
  }

  .table-head {
    display: none;
  }

  .table-row span {
    display: flex;
    justify-content: space-between;
  }
}
</style>
