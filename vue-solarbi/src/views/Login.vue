<template>
  <div class="login-container">
    <div class="login-card tech-card">
      <!-- 登录标题 -->
      <div class="login-header text-center mb-4">
        <div class="login-icon mb-3">
          <i class="bi bi-lightning-charge-fill text-glow-primary"></i>
        </div>
        <h1 class="login-title text-glow-primary mb-2">工具制造电能数据平台</h1>
        <p class="login-subtitle text-secondary">Vue + Bootstrap 版本</p>
      </div>

      <!-- 登录表单 -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="mb-3">
          <label for="userAccount" class="form-label text-glow-primary fw-semibold">
            <i class="bi bi-person me-2"></i>账号
          </label>
          <input
            type="text"
            id="userAccount"
            v-model="loginForm.userAccount"
            class="form-control form-control-glow"
            placeholder="请输入账号"
            required
            :disabled="loading"
          />
        </div>

        <div class="mb-4">
          <label for="userPassword" class="form-label text-glow-primary fw-semibold">
            <i class="bi bi-lock me-2"></i>密码
          </label>
          <div class="password-input-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="userPassword"
              v-model="loginForm.userPassword"
              class="form-control form-control-glow"
              placeholder="请输入密码"
              required
              :disabled="loading"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
              :disabled="loading"
            >
              <i :class="`bi bi-eye${showPassword ? '-slash' : ''}`"></i>
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-glow w-100 py-3 fw-bold"
          :disabled="loading || !isFormValid"
        >
          <span v-if="loading">
            <i class="bi bi-arrow-clockwise me-2 spinning"></i>
            登录中...
          </span>
          <span v-else>
            <i class="bi bi-box-arrow-in-right me-2"></i>
            登录
          </span>
        </button>
      </form>

      <!-- 错误提示 -->
      <div v-if="errorMessage" class="alert alert-danger mt-3" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>
        {{ errorMessage }}
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 表单数据
const loginForm = ref({
  userAccount: '',
  userPassword: ''
})

// 状态管理
const loading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')

// 表单验证
const isFormValid = computed(() => {
  return loginForm.value.userAccount.length > 0 && loginForm.value.userPassword.length > 0
})

// 登录处理
const handleLogin = async () => {
  if (!isFormValid.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    const result = await authStore.login(loginForm.value)
    
    if (result.success) {
      // 登录成功，重定向
      const redirectPath = (route.query.redirect as string) || '/power-monitor'
      router.push(redirectPath)
    } else {
      errorMessage.value = result.error || '登录失败'
    }
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = error instanceof Error ? error.message : '登录失败，请重试'
  } finally {
    loading.value = false
  }
}

// 组件挂载时清空表单
onMounted(() => {
  loginForm.value = {
    userAccount: '',
    userPassword: ''
  }
  errorMessage.value = ''
})
</script>

<style lang="scss" scoped>
</style>
