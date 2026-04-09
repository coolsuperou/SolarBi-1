<template>
  <nav class="sidebar">
    <div class="logo">
      <div class="logo-icon"><i class="bi bi-cpu-fill"></i></div>
      <span class="logo-text">工具制造数据平台</span>
    </div>

    <div class="nav-menu">
      <!-- 统计报表 -->
      <div class="nav-group-title" @click="collapsed.stats = !collapsed.stats">
         统计报表
        <i class="bi collapse-arrow" :class="collapsed.stats ? 'bi-chevron-down' : 'bi-chevron-up'"></i>
      </div>
      <div class="nav-group-items" :class="{ collapsed: collapsed.stats }">
        <router-link v-if="hasPagePermission('monthly-energy')" to="/monthly-energy" class="nav-link">
          <i class="bi bi-calendar3"></i> 月度能耗统计
        </router-link>
        <router-link v-if="hasPagePermission('hourly-energy')" to="/hourly-energy" class="nav-link">
          <i class="bi bi-clock"></i> 日能耗统计
        </router-link>
        <router-link v-if="hasPagePermission('electricity-cost-allocation')" to="/electricity-cost-allocation" class="nav-link">
          <i class="bi bi-calculator"></i> 电费分摊计算
        </router-link>
      </div>

      <!-- 车间监控 -->
      <div class="nav-group-title" @click="collapsed.workshop = !collapsed.workshop">
         车间监控
        <i class="bi collapse-arrow" :class="collapsed.workshop ? 'bi-chevron-down' : 'bi-chevron-up'"></i>
      </div>
      <div class="nav-group-items" :class="{ collapsed: collapsed.workshop }">
        <!-- 前道生产线 -->
        <template v-if="frontWorkshops.length">
          <div class="nav-sub-group-title" @click="collapsed.front = !collapsed.front">
            <i class="bi" :class="collapsed.front ? 'bi-chevron-right' : 'bi-chevron-down'"></i>
            前道生产线
          </div>
          <div class="nav-sub-group-items" :class="{ collapsed: collapsed.front }">
            <router-link v-for="ws in frontWorkshops" :key="ws.path" :to="ws.path" class="nav-link">
              <i :class="'bi ' + ws.meta.icon"></i> {{ ws.meta.title }}
            </router-link>
          </div>
        </template>

        <!-- 无压烧结（独立项） -->
        <template v-for="ws in presslessWorkshops" :key="ws.path">
          <router-link :to="ws.path" class="nav-link nav-standalone">
            <i :class="'bi ' + ws.meta.icon"></i> {{ ws.meta.title }}
          </router-link>
        </template>

        <!-- 后道生产线 -->
        <template v-if="backWorkshops.length">
          <div class="nav-sub-group-title" @click="collapsed.back = !collapsed.back">
            <i class="bi" :class="collapsed.back ? 'bi-chevron-right' : 'bi-chevron-down'"></i>
            后道生产线
          </div>
          <div class="nav-sub-group-items" :class="{ collapsed: collapsed.back }">
            <router-link v-for="ws in backWorkshops" :key="ws.path" :to="ws.path" class="nav-link">
              <i :class="'bi ' + ws.meta.icon"></i> {{ ws.meta.title }}
            </router-link>
          </div>
        </template>

        <!-- 公共模块 -->
        <template v-if="publicWorkshops.length">
          <div class="nav-sub-group-title" @click="collapsed.public_ = !collapsed.public_">
            <i class="bi" :class="collapsed.public_ ? 'bi-chevron-right' : 'bi-chevron-down'"></i>
            公共模块
          </div>
          <div class="nav-sub-group-items" :class="{ collapsed: collapsed.public_ }">
            <router-link v-for="ws in publicWorkshops" :key="ws.path" :to="ws.path" class="nav-link">
              <i :class="'bi ' + ws.meta.icon"></i> {{ ws.meta.title }}
            </router-link>
          </div>
        </template>

        <!-- 其他 -->
        <template v-if="otherWorkshops.length">
          <div class="nav-sub-group-title" @click="collapsed.other = !collapsed.other">
            <i class="bi" :class="collapsed.other ? 'bi-chevron-right' : 'bi-chevron-down'"></i>
            其他
          </div>
          <div class="nav-sub-group-items" :class="{ collapsed: collapsed.other }">
            <router-link v-for="ws in otherWorkshops" :key="ws.path" :to="ws.path" class="nav-link">
              <i :class="'bi ' + ws.meta.icon"></i> {{ ws.meta.title }}
            </router-link>
          </div>
        </template>
      </div>

      <!-- 系统管理 (admin only) -->
      <template v-if="authState.isAdmin">
        <div class="nav-group-title" @click="collapsed.admin = !collapsed.admin">
          ⚙️ 系统管理
          <i class="bi collapse-arrow" :class="collapsed.admin ? 'bi-chevron-down' : 'bi-chevron-up'"></i>
        </div>
        <div class="nav-group-items" :class="{ collapsed: collapsed.admin }">
          <router-link to="/admin/user-management" class="nav-link">
            <i class="bi bi-people-fill"></i> 用户管理
          </router-link>
        </div>
      </template>
    </div>

    <div class="sidebar-footer">
      <div class="user-name">
        <i class="bi bi-person-circle"></i>
        {{ authState.user?.userName || '未登录' }}
      </div>
      <button class="btn-logout" @click="handleLogout">退出登录</button>
    </div>
  </nav>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { authState, hasPagePermission, clearUser } from '@/auth'
import { logout } from '@/api/user'
import { workshopRoutes } from '@/router/index'
import '@/styles/sidebar.css'

const router = useRouter()

const collapsed = reactive({
  stats: false, workshop: false, admin: false,
  front: false, pressless: false, back: false, public_: false, other: false
})

function filterByGroup(group) {
  return workshopRoutes.filter(ws => ws.meta.group === group && hasPagePermission(ws.meta.permKey))
}

const frontWorkshops = computed(() => filterByGroup('front'))
const presslessWorkshops = computed(() => filterByGroup('pressless'))
const backWorkshops = computed(() => filterByGroup('back'))
const publicWorkshops = computed(() => filterByGroup('public'))
const otherWorkshops = computed(() => filterByGroup('other'))

async function handleLogout() {
  try {
    await logout()
  } catch {}
  clearUser()
  router.push('/login')
}
</script>
