<template>
  <div id="app" class="app-container">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  // 应用初始化逻辑
  console.log('Vue SolarBi 应用已启动')
})
</script>

<style lang="scss">
</style>



