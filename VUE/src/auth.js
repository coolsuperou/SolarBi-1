import { reactive } from 'vue'
import { getLoginUser } from './api/user'

export const authState = reactive({
  user: null,
  permissions: {},
  isLoggedIn: false,
  isAdmin: false
})

// 旧版React permKey -> 新版Vue permKey 映射
const legacyKeyMap = {
  'airConditioning': 'air-conditioning',
  'injection_workshop': 'injection-workshop',
  'granulation_workshop': 'granulation-workshop',
  'office_building': 'office-building',
  'feeding_workshop': 'feeding-workshop',
  'granule102': 'granule-102'
}

export function setUser(loginUserVO) {
  authState.user = loginUserVO
  authState.isLoggedIn = true
  authState.isAdmin = loginUserVO.userRole === 'admin'
  try {
    const raw = loginUserVO.pagePermissions
      ? JSON.parse(loginUserVO.pagePermissions)
      : {}
    // 将旧版key映射为新版key
    const mapped = {}
    Object.keys(raw).forEach(key => {
      const newKey = legacyKeyMap[key] || key
      mapped[newKey] = raw[key]
    })
    authState.permissions = mapped
  } catch {
    authState.permissions = {}
  }
}

export function clearUser() {
  authState.user = null
  authState.permissions = {}
  authState.isLoggedIn = false
  authState.isAdmin = false
}

// 路由守卫用：管理员全放行
export function hasPermission(pageKey) {
  if (authState.isAdmin) return true
  return authState.permissions[pageKey] === true
}

// 侧边栏用：严格按 pagePermissions 过滤（管理员也受限）
export function hasPagePermission(pageKey) {
  return authState.permissions[pageKey] === true
}

export async function fetchCurrentUser() {
  try {
    const user = await getLoginUser()
    setUser(user)
  } catch {
    clearUser()
  }
}
