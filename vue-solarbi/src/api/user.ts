import { http } from '@/utils/http'
import type { User, ApiResponse } from '@/types/user'

// 用户管理相关接口
export interface UserQueryRequest {
  current?: number
  pageSize?: number
  keyword?: string
  userRole?: string
  userStatus?: number
}

export interface UserCreateRequest {
  userAccount: string
  userPassword: string
  userName?: string
  userRole: 'user' | 'admin'
  gender?: number
  phone?: string
  email?: string
}

export interface UserUpdateRequest {
  id: number
  userName?: string
  userRole?: 'user' | 'admin'
  gender?: number
  phone?: string
  email?: string
  userStatus?: number
}

export const userApi = {
  // 获取用户列表
  getUserList(params: UserQueryRequest): Promise<ApiResponse<{
    records: User[]
    total: number
    current: number
    pageSize: number
  }>> {
    return http.get('/api/user/list', { params })
  },

  // 创建用户
  createUser(data: UserCreateRequest): Promise<ApiResponse<number>> {
    return http.post('/api/user/add', data)
  },

  // 更新用户
  updateUser(data: UserUpdateRequest): Promise<ApiResponse<boolean>> {
    return http.post('/api/user/update', data)
  },

  // 删除用户
  deleteUser(id: number): Promise<ApiResponse<boolean>> {
    return http.post('/api/user/delete', { id })
  },

  // 更新用户状态
  updateUserStatus(data: { id: number; userStatus: number }): Promise<ApiResponse<boolean>> {
    return http.post('/api/user/update/status', data)
  },

  // 重置用户密码
  resetPassword(data: { id: number; newPassword: string }): Promise<ApiResponse<boolean>> {
    return http.post('/api/user/reset/password', data)
  },

  // 获取用户详情
  getUserById(id: number): Promise<ApiResponse<User>> {
    return http.get(`/api/user/get/${id}`)
  },

  // 检查用户账号是否存在
  checkUserAccount(userAccount: string): Promise<ApiResponse<boolean>> {
    return http.get('/api/user/check/account', { params: { userAccount } })
  }
}
