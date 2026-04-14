export const MOBILE_PREFIX = '/m'

export function isMobilePath(path) {
  return path.startsWith(MOBILE_PREFIX + '/') || path === MOBILE_PREFIX
}

export const M = {
  HOME: `${MOBILE_PREFIX}/home`,
  LOGIN: `${MOBILE_PREFIX}/login`,
  STATS: `${MOBILE_PREFIX}/stats`,
  WORKSHOP: `${MOBILE_PREFIX}/workshop`,
  MINE: `${MOBILE_PREFIX}/mine`,
  MONTHLY_ENERGY: `${MOBILE_PREFIX}/monthly-energy`,
  HOURLY_ENERGY: `${MOBILE_PREFIX}/hourly-energy`,
  ELECTRICITY_COST: `${MOBILE_PREFIX}/electricity-cost-allocation`,
  USER_MGMT: `${MOBILE_PREFIX}/admin/user-management`,
  workshopDetail(slug) {
    return `${MOBILE_PREFIX}/w/${slug}`
  }
}

/**
 * ???????????????????????????? fallback?
 * @param {import('vue-router').Router} router
 * @param {string} fallbackPath ????????????????????
 */
export function goBackOrFallback(router, fallbackPath) {
  if (typeof window === 'undefined') {
    router.push(fallbackPath)
    return
  }
  const st = window.history.state
  const hasVueBack = st != null && st.back != null
  const canBrowserBack = window.history.length > 1
  if (hasVueBack || canBrowserBack) {
    router.back()
    return
  }
  router.push(fallbackPath)
}
