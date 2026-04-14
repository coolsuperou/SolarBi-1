<template>
  <div class="m-login">
    <div class="m-login-card">
      <div class="m-login-logo">
        <div class="m-login-logo__icon"><i class="bi bi-cpu-fill"></i></div>
        <h1>{{ loginTitle }}</h1>
        <p>SolarBi Tool Manufacturing Data Platform</p>
      </div>

      <div v-if="errorMsg" class="m-login-error is-visible">
        <i class="bi bi-exclamation-circle"></i><span>{{ errorMsg }}</span>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="m-form-group">
          <label>{{ labelAccount }}</label>
          <input v-model="userAccount" type="text" :placeholder="phAccount" autocomplete="username" />
        </div>
        <div class="m-form-group">
          <label>{{ labelPassword }}</label>
          <input v-model="userPassword" type="password" :placeholder="phPassword" autocomplete="current-password" />
        </div>
        <button type="submit" class="m-btn m-btn--primary m-btn--block" style="padding: 14px" :disabled="loading || !userAccount || !userPassword">
          {{ loading ? loginLoadingText : loginBtnText }}
        </button>
      </form>
      <p style="text-align: center; margin-top: 16px; font-size: 13px">
        <RouterLink to="/login" style="color: var(--primary, #3b82f6)">{{ desktopLoginLink }}</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api/user'
import { setUser } from '@/auth'
import { M } from '@/router/mobileUtils'
import '@/styles/mobile/mobile-base.css'

const loginTitle = '\u5de5\u5177\u5236\u9020\u6570\u636e\u5e73\u53f0'
const labelAccount = '\u8d26\u53f7'
const labelPassword = '\u5bc6\u7801'
const phAccount = '\u8bf7\u8f93\u5165\u8d26\u53f7'
const phPassword = '\u8bf7\u8f93\u5165\u5bc6\u7801'
const loginLoadingText = '\u767b\u5f55\u4e2d...'
const loginBtnText = '\u767b \u5f55'
const desktopLoginLink = '\u7535\u8111\u7248\u767b\u5f55'
const loginFailText = '\u767b\u5f55\u5931\u8d25'

const router = useRouter()
const userAccount = ref('')
const userPassword = ref('')
const errorMsg = ref('')
const loading = ref(false)

async function handleLogin() {
  errorMsg.value = ''
  loading.value = true
  try {
    const loginUserVO = await login(userAccount.value, userPassword.value)
    setUser(loginUserVO)
    router.push(M.HOME)
  } catch (err) {
    errorMsg.value = err.message || loginFailText
  } finally {
    loading.value = false
  }
}
</script>
