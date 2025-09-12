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

      <!-- 测试账号提示 -->
      <div class="login-tips mt-4">
        <div class="tips-card tech-card p-3">
          <h6 class="text-glow-secondary mb-2">
            <i class="bi bi-info-circle me-2"></i>测试账号
          </h6>
          <div class="tips-content">
            <p class="mb-1 text-secondary">
              <strong>管理员：</strong> admin / 123456
            </p>
            <p class="mb-0 text-secondary">
              <strong>普通用户：</strong> user / 123456
            </p>
          </div>
        </div>
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
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-lg;
  position: relative;
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: $spacing-xxl;
  position: relative;
  z-index: 2;
  
  @media (max-width: 576px) {
    padding: $spacing-xl;
    max-width: 100%;
  }
}

.login-header {
  .login-icon {
    font-size: 4rem;
    filter: drop-shadow($glow-strong);
    
    @media (max-width: 576px) {
      font-size: 3rem;
    }
  }
  
  .login-title {
    font-size: $font-size-title;
    font-weight: 700;
    margin-bottom: $spacing-sm;
    
    @media (max-width: 576px) {
      font-size: 1.5rem;
    }
  }
  
  .login-subtitle {
    font-size: $font-size-sm;
    opacity: 0.8;
  }
}

.login-form {
  .form-label {
    font-size: $font-size-sm;
    margin-bottom: $spacing-sm;
  }
  
  .password-input-wrapper {
    position: relative;
    
    .password-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: $text-glow;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        color: lighten($text-glow, 20%);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}

.alert-danger {
  background: rgba(255, 61, 113, 0.1);
  border: 1px solid rgba(255, 61, 113, 0.3);
  color: $danger-color;
  border-radius: $border-radius-md;
}

.login-tips {
  .tips-card {
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.05));
    border-color: rgba(168, 85, 247, 0.3);
    
    h6 {
      margin-bottom: $spacing-sm;
    }
    
    .tips-content {
      font-size: $font-size-sm;
      
      p {
        line-height: 1.5;
      }
      
      strong {
        color: $text-glow;
      }
    }
  }
}

// 加载动画
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinning {
  animation: spin 1s linear infinite;
}

// 响应式调整
@media (max-width: 576px) {
  .login-container {
    padding: $spacing-md;
  }
}
</style>
