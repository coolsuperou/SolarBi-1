<template>
  <nav class="sidebar">
    <div class="logo">
      <div class="logo-icon">⚡</div>
      <span class="logo-text">电能监控平台</span>
    </div>

    <div class="nav-menu">
      <!-- 统计报表 -->
      <div class="nav-group-title">📊 统计报表</div>
      <router-link v-if="hasPermission('monthly-energy')" to="/monthly-energy" class="nav-link">
        <i class="bi bi-calendar3"></i> 月度能耗统计
      </router-link>
      <router-link v-if="hasPermission('hourly-energy')" to="/hourly-energy" class="nav-link">
        <i class="bi bi-clock"></i> 日能耗统计
      </router-link>
      <router-link v-if="hasPermission('electricity-cost-allocation')" to="/electricity-cost-allocation" class="nav-link">
        <i class="bi bi-calculator"></i> 电费分摊计算
      </router-link>

      <!-- 车间监控 -->
      <div class="nav-group-title">🏭 车间监控</div>
      <router-link
        v-for="ws in visibleWorkshops"
        :key="ws.path"
        :to="ws.path"
        class="nav-link"
      >
        <i :class="'bi ' + ws.meta.icon"></i> {{ ws.meta.title }}
      </router-link>

      <!-- 系统管理 (admin only) -->
      <template v-if="authState.isAdmin">
        <div class="nav-group-title">⚙️ 系统管理</div>
        <router-link to="/admin/user-management" class="nav-link">
          <i class="bi bi-people-fill"></i> 用户管理
        </router-link>
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
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { authState, hasPermission, clearUser } from '@/auth'
import { logout } from '@/api/user'
import { workshopRoutes } from '@/router/index'
import '@/styles/sidebar.css'

const router = useRouter()

const visibleWorkshops = computed(() => {
  return workshopRoutes.filter(ws => hasPermission(ws.meta.permKey))
})

async function handleLogout() {
  try {
    await logout()
  } catch {}
  clearUser()
  router.push('/login')
}
</script>
