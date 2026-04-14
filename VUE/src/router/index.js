import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/desktop/Login.vue'
import MonthlyEnergy from '@/views/desktop/MonthlyEnergy.vue'
import HourlyEnergy from '@/views/desktop/HourlyEnergy.vue'
import ElectricityCost from '@/views/desktop/ElectricityCost.vue'
import Workshop from '@/views/desktop/Workshop.vue'
import MobileWorkshop from '@/views/mobile/Workshop.vue'
import UserManagement from '@/views/desktop/UserManagement.vue'
import { workshopRouteEntries } from '@/router/workshopRoutesConfig'
import { resolveRootRedirectPath } from '@/router/rootRedirect'
import { MOBILE_PREFIX, isMobilePath, M } from '@/router/mobileUtils'
import MobileTabLayout from '@/components/MobileTabLayout.vue'
import MobileHome from '@/views/mobile/MobileHome.vue'
import MobileStats from '@/views/mobile/MobileStats.vue'
import MobileWorkshopHub from '@/views/mobile/MobileWorkshopHub.vue'
import MobileMine from '@/views/mobile/MobileMine.vue'
import MobileMonthlyEnergyPage from '@/views/mobile/MobileMonthlyEnergyPage.vue'
import MobileHourlyEnergyPage from '@/views/mobile/MobileHourlyEnergyPage.vue'
import MobileElectricityCostPage from '@/views/mobile/MobileElectricityCostPage.vue'
import MobileUserManagementPage from '@/views/mobile/MobileUserManagementPage.vue'
import MobileWorkshopShell from '@/components/MobileWorkshopShell.vue'

export const workshopRoutes = workshopRouteEntries.map((e) => ({
  path: e.path,
  component: Workshop,
  meta: e.meta
}))

function buildMobileWorkshopRoutes() {
  return workshopRouteEntries.map((e) => {
    const slug = e.path.replace(/^\//, '')
    return {
      path: `w/${slug}`,
      component: MobileWorkshopShell,
      meta: { hideTab: true, title: e.meta.title, permKey: e.meta.permKey },
      children: [{ path: '', component: MobileWorkshop, meta: e.meta }]
    }
  })
}

const mobileChildRoutes = [
  { path: '', redirect: 'home' },
  { path: 'home', name: 'm-home', component: MobileHome },
  { path: 'stats', component: MobileStats },
  { path: 'workshop', component: MobileWorkshopHub },
  { path: 'mine', component: MobileMine },
  {
    path: 'monthly-energy',
    component: MobileMonthlyEnergyPage,
    meta: { permKey: 'monthly-energy', hideTab: true }
  },
  {
    path: 'hourly-energy',
    component: MobileHourlyEnergyPage,
    meta: { permKey: 'hourly-energy', hideTab: true }
  },
  {
    path: 'electricity-cost-allocation',
    component: MobileElectricityCostPage,
    meta: { permKey: 'electricity-cost-allocation', hideTab: true }
  },
  {
    path: 'admin/user-management',
    component: MobileUserManagementPage,
    meta: { permKey: 'user-management', requireAdmin: true, hideTab: true }
  },
  ...buildMobileWorkshopRoutes()
]

const routes = [
  { path: '/', redirect: () => resolveRootRedirectPath() },
  { path: '/login', component: Login, meta: { guest: true } },
  { path: M.LOGIN, component: Login, meta: { guest: true } },
  {
    path: MOBILE_PREFIX,
    component: MobileTabLayout,
    children: mobileChildRoutes
  },
  { path: '/monthly-energy', component: MonthlyEnergy, meta: { permKey: 'monthly-energy' } },
  { path: '/hourly-energy', component: HourlyEnergy, meta: { permKey: 'hourly-energy' } },
  { path: '/electricity-cost-allocation', component: ElectricityCost, meta: { permKey: 'electricity-cost-allocation' } },
  { path: '/admin/user-management', component: UserManagement, meta: { permKey: 'user-management', requireAdmin: true } },
  ...workshopRoutes
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

import { authState, fetchCurrentUser, hasPermission } from '@/auth'

router.beforeEach(async (to, from, next) => {
  if (to.path === '/login' || to.path === M.LOGIN) {
    if (authState.isLoggedIn) {
      next(to.path === M.LOGIN ? M.HOME : resolveRootRedirectPath())
    } else {
      next()
    }
    return
  }

  if (!authState.isLoggedIn) {
    await fetchCurrentUser()
    if (!authState.isLoggedIn) {
      next(isMobilePath(to.path) ? M.LOGIN : '/login')
      return
    }
  }

  if (to.meta?.requireAdmin && !authState.isAdmin) {
    next(isMobilePath(to.path) ? M.HOME : resolveRootRedirectPath())
    return
  }

  if (authState.isAdmin) {
    next()
    return
  }

  const permKey = to.meta?.permKey
  if (permKey && !hasPermission(permKey)) {
    next(isMobilePath(to.path) ? M.HOME : resolveRootRedirectPath())
    return
  }

  next()
})

export default router
