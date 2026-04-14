<template>
  <div class="m-sub-page">
    <header class="m-header">
      <button type="button" class="m-header__action" style="padding-left: 0" :aria-label="backLabel" @click="goBack">
        <i class="bi bi-chevron-left" style="font-size: 20px"></i>
      </button>
      <h2 class="m-header__title m-header__title--center">{{ title }}</h2>
      <span class="m-header__spacer" aria-hidden="true"></span>
    </header>
    <main class="m-content m-desktop-embed">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { M, goBackOrFallback } from '@/router/mobileUtils'

const backLabel = '\u8fd4\u56de'

const route = useRoute()
const router = useRouter()

const title = computed(() => route.meta?.title || '')

function goBack() {
  goBackOrFallback(router, M.WORKSHOP)
}
</script>
