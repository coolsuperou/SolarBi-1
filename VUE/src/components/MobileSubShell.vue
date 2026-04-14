<template>
  <div class="m-sub-page">
    <header class="m-header">
      <button type="button" class="m-header__action" style="padding-left: 0" :aria-label="backLabel" @click="goBack">
        <i class="bi bi-chevron-left" style="font-size: 20px"></i>
      </button>
      <h2 class="m-header__title m-header__title--center">{{ title }}</h2>
      <span class="m-header__spacer" aria-hidden="true"></span>
    </header>
    <main class="m-content" :class="contentClass">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { M, goBackOrFallback } from '@/router/mobileUtils'

const backLabel = '\u8fd4\u56de'

defineProps({
  title: { type: String, required: true },
  /** 主内容区附加 class，电费页用 design/mobile 的 cost-ec-wrap */
  contentClass: { type: String, default: 'm-desktop-embed' }
})

const router = useRouter()

function goBack() {
  goBackOrFallback(router, M.HOME)
}
</script>
