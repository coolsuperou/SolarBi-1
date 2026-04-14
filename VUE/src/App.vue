<template>
  <template v-if="isMobileShell">
    <router-view />
  </template>
  <template v-else-if="route.path !== '/login'">
    <div class="page-wrapper">
      <Sidebar />
      <div class="sidebar-placeholder"></div>
      <div class="main-content">
        <router-view />
      </div>
    </div>
  </template>
  <router-view v-else />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import { isMobilePath } from '@/router/mobileUtils'

const route = useRoute()

const isMobileShell = computed(() => isMobilePath(route.path))
</script>
