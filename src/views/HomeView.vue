<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ModalDialog from '../components/ModalDialog.vue'
import { apiRequest } from '../services/api'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const showRegister = ref(false)
const showLogin = ref(false)

const registerForm = ref({
  email: '',
  username: '',
  password: '',
})

const loginForm = ref({
  email: '',
  password: '',
})

const isRegistering = ref(false)
const isLoggingIn = ref(false)

const submitRegister = async () => {
  isRegistering.value = true
  try {
    await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerForm.value),
    })
    showRegister.value = false
  } finally {
    isRegistering.value = false
  }
}

const submitLogin = async () => {
  isLoggingIn.value = true
  try {
    const response = await apiRequest<{ token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginForm.value),
    })
    if (response?.token) {
      authStore.setToken(response.token)
      await router.push('/dashboard')
    }
  } finally {
    isLoggingIn.value = false
  }
}
</script>

<template>
  <div class="page home">
    <header class="hero">
      <div class="container hero-content">
        <div>
          <p class="eyebrow">Code Armor</p>
          <h1>Deploy your front-end projects in minutes.</h1>
          <p class="subtext">
            Upload your source package, let Code Armor handle the build and deployment, and
            receive a ready-to-share Firebase Hosting URL.
          </p>
          <div class="hero-actions">
            <button class="primary-button" type="button" @click="showRegister = true">
              Create account
            </button>
            <button class="secondary-button" type="button" @click="showLogin = true">
              Sign in
            </button>
          </div>
        </div>
        <div class="hero-card">
          <div class="hero-graphic">
            <div class="bubble"></div>
            <div class="bubble bubble-alt"></div>
            <div class="hero-terminal">
              <p>✔ Detect framework</p>
              <p>✔ Compile &amp; bundle</p>
              <p>✔ Deploy to Firebase</p>
              <p>✔ Share instantly</p>
            </div>
          </div>
          <div class="hero-card-footer">
            <p>Reliable deployment for React, Vue, Angular, and static sites.</p>
          </div>
        </div>
      </div>
    </header>

    <section class="container features">
      <div>
        <h2>Why teams choose Code Armor</h2>
        <p>Every upload is compiled, deployed, and tracked with transparent status updates.</p>
      </div>
      <div class="feature-grid">
        <div class="feature-card">
          <h3>Instant insights</h3>
          <p>See detection, compilation, and deployment status updates in one place.</p>
        </div>
        <div class="feature-card">
          <h3>Secure &amp; controlled</h3>
          <p>Your deployments stay tied to your account with token-based access.</p>
        </div>
        <div class="feature-card">
          <h3>Built for sharing</h3>
          <p>Receive a hosted URL and send it to stakeholders instantly.</p>
        </div>
      </div>
    </section>

    <ModalDialog title="Create your account" :is-open="showRegister" @close="showRegister = false">
      <form class="form-stack" @submit.prevent="submitRegister">
        <div class="form-field">
          <label for="register-email">Email</label>
          <input id="register-email" v-model="registerForm.email" type="email" required />
        </div>
        <div class="form-field">
          <label for="register-username">Username</label>
          <input id="register-username" v-model="registerForm.username" type="text" required />
        </div>
        <div class="form-field">
          <label for="register-password">Password</label>
          <input id="register-password" v-model="registerForm.password" type="password" required />
        </div>
        <button class="primary-button" type="submit" :disabled="isRegistering">
          {{ isRegistering ? 'Creating...' : 'Create account' }}
        </button>
      </form>
    </ModalDialog>

    <ModalDialog title="Welcome back" :is-open="showLogin" @close="showLogin = false">
      <form class="form-stack" @submit.prevent="submitLogin">
        <div class="form-field">
          <label for="login-email">Email</label>
          <input id="login-email" v-model="loginForm.email" type="email" required />
        </div>
        <div class="form-field">
          <label for="login-password">Password</label>
          <input id="login-password" v-model="loginForm.password" type="password" required />
        </div>
        <button class="primary-button" type="submit" :disabled="isLoggingIn">
          {{ isLoggingIn ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>
    </ModalDialog>
  </div>
</template>

<style scoped>
.hero {
  padding: 80px 0 60px;
  background: radial-gradient(circle at top right, rgba(37, 99, 235, 0.2), transparent 40%),
    radial-gradient(circle at bottom left, rgba(14, 165, 233, 0.15), transparent 35%);
}

.hero-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  align-items: center;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.75rem;
  color: #2563eb;
  font-weight: 600;
  margin-bottom: 12px;
}

h1 {
  font-size: clamp(2.2rem, 3vw, 3.2rem);
  line-height: 1.15;
  margin-bottom: 16px;
}

.subtext {
  color: #475569;
  margin-bottom: 24px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-card {
  background: #fff;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 25px 45px rgba(15, 23, 42, 0.12);
}

.hero-graphic {
  position: relative;
  min-height: 180px;
  border-radius: 18px;
  background: #0f172a;
  padding: 24px;
  color: #e2e8f0;
  overflow: hidden;
}

.bubble {
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(37, 99, 235, 0.3);
  top: -40px;
  right: -20px;
}

.bubble-alt {
  width: 160px;
  height: 160px;
  background: rgba(56, 189, 248, 0.3);
  bottom: -80px;
  left: -40px;
  top: auto;
}

.hero-terminal {
  position: relative;
  display: grid;
  gap: 8px;
  font-family: 'JetBrains Mono', 'SFMono-Regular', ui-monospace, SFMono-Regular, Menlo, Monaco,
    Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.85rem;
}

.hero-card-footer {
  margin-top: 16px;
  color: #475569;
}

.features {
  padding: 40px 0 80px;
  display: grid;
  gap: 24px;
}

.feature-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.feature-card {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.form-stack {
  display: grid;
  gap: 16px;
}
</style>
