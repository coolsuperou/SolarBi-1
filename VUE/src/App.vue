<template>
  <div class="page-wrapper" v-if="route.path !== '/login'">
    <Sidebar />
    <div class="sidebar-placeholder"></div>
    <div class="main-content">
      <router-view />
    </div>
  </div>
  <router-view v-else />
</template>

<script setup>
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'

const route = useRoute()
</script>
