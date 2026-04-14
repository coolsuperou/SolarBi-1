import { M } from '@/router/mobileUtils'

export const ROOT_MOBILE_MAX_WIDTH_PX = 768

export function resolveRootRedirectPath() {
  if (typeof window === 'undefined') return '/monthly-energy'
  const narrow = window.matchMedia(`(max-width: ${ROOT_MOBILE_MAX_WIDTH_PX}px)`).matches
  const touchPrimary = window.matchMedia('(any-pointer: coarse)').matches
  if (narrow && touchPrimary) return M.HOME
  return '/monthly-energy'
}
