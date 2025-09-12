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
.app-container {
  min-height: 100vh;
  width: 100%;
}

// 全局样式重置
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #0a1929 0%, #1a237e 50%, #000051 100%);
  color: #ffffff;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
}
</style>
