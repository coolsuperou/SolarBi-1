import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/user'
import { authApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  // 计算属性（后端使用会话 Cookie，判定以 user 是否存在为准）
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.userRole === 'admin')

  // 登录（真实接口）
  const login = async (credentials: { userAccount: string; userPassword: string }) => {
    try {
      const resp = await authApi.login(credentials)
      const payload = resp.data

      // 若返回 token 则保存；否则依赖后端会话 Cookie
      if (payload?.token) {
        token.value = payload.token
        localStorage.setItem('token', payload.token)
      }

      if (payload?.user) {
        user.value = payload.user
      } else {
        const me = await authApi.getCurrentUser()
        user.value = me.data as unknown as User
      }

      if (user.value) {
        localStorage.setItem('user', JSON.stringify(user.value))
      }

      return { success: true }
    } catch (error: any) {
      console.error('Login error:', error)
      user.value = null
      token.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return { success: false, error: error?.message || '登录失败' }
    }
  }

  // 登出（真实接口）
  const logout = async () => {
    try {
      await authApi.logout()
    } catch (e) {
      // 忽略接口错误
    }
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 初始化用户信息
  const initAuth = async () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken) {
      token.value = storedToken
    }
    
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (e) {
        user.value = null
      }
    }

    try {
      const me = await authApi.getCurrentUser()
      if (me?.data) {
        user.value = me.data as unknown as User
        localStorage.setItem('user', JSON.stringify(user.value))
      }
    } catch (e) {
      await logout()
    }
  }

  // 获取当前用户信息（真实接口）
  const getCurrentUser = async () => {
    try {
      const resp = await authApi.getCurrentUser()
      user.value = resp.data as unknown as User
      localStorage.setItem('user', JSON.stringify(user.value))
    } catch (error) {
      console.error('Get current user error:', error)
      await logout()
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    initAuth,
    getCurrentUser
  }
})
