<template>
  <div class="shell-app">
    <div class="shell-body">
      <router-view />
    </div>
    <nav v-show="!hideTab" class="shell-bnav" :aria-label="mTabBar.navAria">
      <RouterLink class="shell-bnav__link" :to="M.HOME" active-class="router-link-active">
        <i class="bi bi-house-door-fill"></i><span>{{ mTabBar.home }}</span>
      </RouterLink>
      <RouterLink class="shell-bnav__link" :to="M.STATS" active-class="router-link-active">
        <i class="bi bi-bar-chart-line"></i><span>{{ mTabBar.stats }}</span>
      </RouterLink>
      <RouterLink class="shell-bnav__link" :to="M.WORKSHOP" active-class="router-link-active">
        <i class="bi bi-building"></i><span>{{ mTabBar.workshop }}</span>
      </RouterLink>
      <RouterLink class="shell-bnav__link" :to="M.MINE" active-class="router-link-active">
        <i class="bi bi-person-circle"></i><span>{{ mTabBar.mine }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { M } from '@/router/mobileUtils'
import { mTabBar } from '@/views/mobile/mobileUiStrings'
import '@/styles/mobile/mobile-base.css'
import '@/styles/mobile/mobile-shell.css'
import '@/styles/mobile/mobile-embed.css'

const route = useRoute()
const hideTab = computed(() => Boolean(route.meta.hideTab))
</script>
