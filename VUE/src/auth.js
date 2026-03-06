import { reactive } from 'vue'
import { getLoginUser } from './api/user'

export const authState = reactive({
  user: null,
  permissions: {},
  isLoggedIn: false,
  isAdmin: false
})

export function setUser(loginUserVO) {
  authState.user = loginUserVO
  authState.isLoggedIn = true
  authState.isAdmin = loginUserVO.userRole === 'admin'
  try {
    authState.permissions = loginUserVO.pagePermissions
      ? JSON.parse(loginUserVO.pagePermissions)
      : {}
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

export function hasPermission(pageKey) {
  if (authState.isAdmin) return true
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
