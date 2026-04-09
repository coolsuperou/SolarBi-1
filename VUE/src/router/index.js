import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import MonthlyEnergy from '@/views/MonthlyEnergy.vue'
import HourlyEnergy from '@/views/HourlyEnergy.vue'
import ElectricityCost from '@/views/ElectricityCost.vue'
import Workshop from '@/views/Workshop.vue'
import UserManagement from '@/views/UserManagement.vue'

/**
 * 28 个车间路由配置
 * 每个路由 meta 包含：title（车间中文名）、apiBase（后端路径）、workshop（后端参数）、permKey（权限key）、icon（图标）
 */
/**
 * 车间分组定义（参照老系统用电管理 → 部门级结构）
 * group: front=前道生产线, pressless=无压烧结, back=后道生产线, public=公共模块, other=其他
 */
export const workshopRoutes = [
  // ── 前道生产线 ──
  { path: '/feeding-workshop', component: Workshop, meta: { title: '101配料', apiBase: 'feeding-workshop', workshop: '101配料', permKey: 'feeding-workshop', icon: 'bi-funnel', group: 'front' } },
  { path: '/granule-102', component: Workshop, meta: { title: '102造粒', apiBase: 'granule102', workshop: '102造粒', permKey: 'granule-102', icon: 'bi-circle', group: 'front' } },
  { path: '/granulation-workshop', component: Workshop, meta: { title: '102造粒环保设备', apiBase: 'granulation-workshop', workshop: '102造粒环保设备', permKey: 'granulation-workshop', icon: 'bi-recycle', group: 'front' } },
  { path: '/cold-press-103', component: Workshop, meta: { title: '103冷压', apiBase: 'cold-press-103', workshop: '103冷压', permKey: 'cold-press-103', icon: 'bi-snow', group: 'front' } },
  { path: '/restoration-104', component: Workshop, meta: { title: '104还原', apiBase: 'restoration-104', workshop: '104还原', permKey: 'restoration-104', icon: 'bi-arrow-counterclockwise', group: 'front' } },
  { path: '/sintering-105', component: Workshop, meta: { title: '105烧结', apiBase: 'sintering-105', workshop: '105烧结', permKey: 'sintering-105', icon: 'bi-fire', group: 'front' } },
  // ── 无压烧结（独立） ──
  { path: '/pressless-sintering', component: Workshop, meta: { title: '无压烧结', apiBase: 'pressless-sintering', workshop: '无压烧结', permKey: 'pressless-sintering', icon: 'bi-fire', group: 'pressless' } },
  // ── 后道生产线 ──
  { path: '/cleaning-106', component: Workshop, meta: { title: '106清洗', apiBase: 'cleaning-106', workshop: '106清洗', permKey: 'cleaning-106', icon: 'bi-droplet', group: 'back' } },
  { path: '/beading-107', component: Workshop, meta: { title: '107串珠', apiBase: 'beading-107', workshop: '107串珠', permKey: 'beading-107', icon: 'bi-gem', group: 'back' } },
  { path: '/rubber-109', component: Workshop, meta: { title: '109炼胶', apiBase: 'rubber-109', workshop: '109炼胶', permKey: 'rubber-109', icon: 'bi-vinyl', group: 'back' } },
  { path: '/injection-110', component: Workshop, meta: { title: '110注射', apiBase: 'injection-110', workshop: '110注射', permKey: 'injection-110', icon: 'bi-eyedropper', group: 'back' } },
  { path: '/injection-workshop', component: Workshop, meta: { title: '110注射环保设备', apiBase: 'injection-workshop', workshop: '110注射环保设备', permKey: 'injection-workshop', icon: 'bi-recycle', group: 'back' } },
  { path: '/edging-111', component: Workshop, meta: { title: '111开刃', apiBase: 'edging-111', workshop: '111开刃', permKey: 'edging-111', icon: 'bi-scissors', group: 'back' } },
  // ── 公共模块 ──
  { path: '/final-inspection-112', component: Workshop, meta: { title: '112终检', apiBase: 'final-inspection-112', workshop: '112终检', permKey: 'final-inspection-112', icon: 'bi-check-circle', group: 'public' } },
  { path: '/warehouse-113', component: Workshop, meta: { title: '113仓库', apiBase: 'warehouse113', workshop: '113仓库', permKey: 'warehouse-113', icon: 'bi-box', group: 'public' } },
  { path: '/public-114', component: Workshop, meta: { title: '114公共', apiBase: 'public114', workshop: '114公共', permKey: 'public-114', icon: 'bi-building', group: 'public' } },
  { path: '/air-conditioning', component: Workshop, meta: { title: '114_空调水机主机', apiBase: 'air-conditioning', workshop: '114_空调水机主机', permKey: 'air-conditioning', icon: 'bi-thermometer', group: 'public' } },
  { path: '/air-compressor-114', component: Workshop, meta: { title: '114空压机', apiBase: 'aircompressor114', workshop: '114空压机', permKey: 'air-compressor-114', icon: 'bi-cpu', group: 'public' } },
  { path: '/elevator-114', component: Workshop, meta: { title: '114_2#厂房电梯', apiBase: 'elevator114', workshop: '114_2#厂房电梯', permKey: 'elevator-114', icon: 'bi-arrow-up-square', group: 'public' } },
  { path: '/office-area-114', component: Workshop, meta: { title: '114_2#楼办公区域', apiBase: 'officearea114', workshop: '114_2#楼办公区域', permKey: 'office-area-114', icon: 'bi-pc-display', group: 'public' } },
  { path: '/conference-room-114', component: Workshop, meta: { title: '114_2#楼会议室', apiBase: 'conferenceroom114', workshop: '114_2#楼会议室', permKey: 'conference-room-114', icon: 'bi-people', group: 'public' } },
  { path: '/laboratory-114', component: Workshop, meta: { title: '114_2#楼实验室', apiBase: 'laboratory114', workshop: '114_2#楼实验室', permKey: 'laboratory-114', icon: 'bi-flask', group: 'public' } },
  // ── 其他 ──
  { path: '/office-building', component: Workshop, meta: { title: '1#办公楼', apiBase: 'office-building', workshop: '1#办公楼', permKey: 'office-building', icon: 'bi-building', group: 'other' } },
  { path: '/tool-rd-center', component: Workshop, meta: { title: '工具研发中心', apiBase: 'toolrdcenter', workshop: '工具研发中心', permKey: 'tool-rd-center', icon: 'bi-tools', group: 'other' } },
  { path: '/charging-pile', component: Workshop, meta: { title: '充电桩', apiBase: 'chargingpile', workshop: '充电桩', permKey: 'charging-pile', icon: 'bi-lightning-charge', group: 'other' } },
  { path: '/guard-room', component: Workshop, meta: { title: '门卫室', apiBase: 'guardroom', workshop: '门卫室', permKey: 'guard-room', icon: 'bi-shield', group: 'other' } },
  { path: '/canteen', component: Workshop, meta: { title: '食堂', apiBase: 'canteen', workshop: '食堂', permKey: 'canteen', icon: 'bi-cup-hot', group: 'other' } },
  { path: '/dormitory', component: Workshop, meta: { title: '宿舍楼', apiBase: 'dormitory', workshop: '宿舍楼', permKey: 'dormitory', icon: 'bi-house', group: 'other' } },
]

const routes = [
  { path: '/', redirect: '/monthly-energy' },
  { path: '/login', component: Login },
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
  // 访问登录页
  if (to.path === '/login') {
    if (authState.isLoggedIn) {
      next('/monthly-energy')
    } else {
      next()
    }
    return
  }

  // 未登录，尝试获取用户信息
  if (!authState.isLoggedIn) {
    await fetchCurrentUser()
    if (!authState.isLoggedIn) {
      next('/login')
      return
    }
  }

  // 已登录，admin 全部放行
  if (authState.isAdmin) {
    next()
    return
  }

  // 普通用户权限检查
  const permKey = to.meta?.permKey
  if (permKey && !hasPermission(permKey)) {
    next('/monthly-energy')
    return
  }

  next()
})

export default router
