import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/user'
import { authApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.userRole === 'admin')

  // 登录（使用模拟数据）
  const login = async (credentials: { userAccount: string; userPassword: string }) => {
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const { userAccount, userPassword } = credentials
      
      // 模拟用户数据
      const mockUsers = [
        {
          id: 1,
          userAccount: 'admin',
          userName: '管理员',
          userRole: 'admin' as const,
          userAvatar: '',
          email: 'admin@example.com',
          phone: '13800138000',
          userStatus: 0
        },
        {
          id: 2,
          userAccount: 'user',
          userName: '普通用户',
          userRole: 'user' as const,
          userAvatar: '',
          email: 'user@example.com',
          phone: '13800138001',
          userStatus: 0
        }
      ]
      
      // 验证用户账号和密码
      const mockUser = mockUsers.find(u => u.userAccount === userAccount)
      
      if (!mockUser) {
        throw new Error('用户不存在')
      }
      
      if (userPassword !== '123456') {
        throw new Error('密码错误')
      }
      
      // 模拟登录成功
      token.value = `mock-token-${Date.now()}`
      user.value = mockUser
      
      // 存储到本地存储
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error instanceof Error ? error.message : '登录失败' }
    }
  }

  // 登出
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 初始化用户信息
  const initAuth = async () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
        
        // 验证token是否有效（可选）
        // await authApi.getCurrentUser()
      } catch (error) {
        console.error('Init auth error:', error)
        logout()
      }
    }
  }

  // 获取当前用户信息（使用本地存储的数据）
  const getCurrentUser = async () => {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        user.value = JSON.parse(storedUser)
      }
    } catch (error) {
      console.error('Get current user error:', error)
      logout()
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
