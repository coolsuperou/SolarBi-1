import { http } from '@/utils/http'
import type { LoginRequest, LoginResponse, User, ApiResponse } from '@/types/user'

export const authApi = {
  // 用户登录
  login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return http.post('/api/user/login', data)
  },

  // 获取当前用户信息
  getCurrentUser(): Promise<ApiResponse<User>> {
    return http.get('/api/user/get/login')
  },

  // 用户注册
  register(data: {
    userAccount: string
    userPassword: string
    checkPassword: string
  }): Promise<ApiResponse<number>> {
    return http.post('/api/user/register', data)
  },

  // 用户登出
  logout(): Promise<ApiResponse<boolean>> {
    return http.post('/api/user/logout')
  }
}
