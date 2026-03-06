<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <div class="logo-icon"><i class="bi bi-lightning-charge-fill"></i></div>
        <h3>电能监控平台</h3>
        <p>SolarBi Energy Monitoring</p>
      </div>

      <div v-if="errorMsg" class="login-error">
        <i class="bi bi-exclamation-circle"></i> {{ errorMsg }}
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">账号</label>
          <input v-model="userAccount" type="text" class="form-input" placeholder="请输入账号" />
        </div>
        <div class="form-group">
          <label class="form-label">密码</label>
          <input v-model="userPassword" type="password" class="form-input" placeholder="请输入密码" />
        </div>
        <button type="submit" class="btn-login" :disabled="loading || !userAccount || !userPassword">
          {{ loading ? '登录中...' : '登 录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api/user'
import { setUser } from '@/auth'
import '@/styles/login.css'

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
    router.push('/monthly-energy')
  } catch (err) {
    errorMsg.value = err.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>
