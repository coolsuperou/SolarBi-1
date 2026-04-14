<template>
  <div>
    <header class="m-header" style="margin-bottom: 0">
      <h2 class="m-header__title">{{ mMine.title }}</h2>
    </header>
    <p class="m-hint" style="margin: 8px 16px 0">{{ mMine.hint }}</p>
    <div class="mine-card">
      <div class="mine-card__av"><i class="bi bi-person-fill"></i></div>
      <div>
        <div style="font-weight: 700; font-size: 16px">{{ authState.user?.userName || emDash }}</div>
        <div style="font-size: 12px; color: #64748b; margin-top: 2px">
          {{ authState.isAdmin ? mMine.admin : mMine.user }}
        </div>
      </div>
    </div>
    <ul class="mine-list">
      <li v-if="authState.isAdmin">
        <RouterLink :to="M.USER_MGMT">
          <i class="bi bi-people-fill" style="color: #1677ff"></i>
          {{ mMine.userMgmt }}
          <span class="mine-badge">{{ mMine.badgeAdmin }}</span>
          <i class="bi bi-chevron-right"></i>
        </RouterLink>
      </li>
      <li>
        <button type="button" disabled>
          <i class="bi bi-gear" style="color: #1677ff"></i> {{ mMine.settings }}
          <i class="bi bi-chevron-right"></i>
        </button>
      </li>
      <li>
        <button type="button" disabled>
          <i class="bi bi-info-circle" style="color: #1677ff"></i> {{ mMine.about }}
          <i class="bi bi-chevron-right"></i>
        </button>
      </li>
      <li>
        <button type="button" @click="handleLogout">
          <i class="bi bi-box-arrow-right" style="color: #dc2626"></i> {{ mMine.logout }}
          <i class="bi bi-chevron-right"></i>
        </button>
      </li>
    </ul>
    <p class="mine-hint">{{ mMine.footHint }}</p>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { authState, clearUser } from '@/auth'
import { logout } from '@/api/user'
import { mMine } from '@/views/mobile/mobileUiStrings'
import { M } from '@/router/mobileUtils'

const emDash = '\u2014'
const router = useRouter()

async function handleLogout() {
  try {
    await logout()
  } catch {}
  clearUser()
  router.push(M.LOGIN)
}
</script>
