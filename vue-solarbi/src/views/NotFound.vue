<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-icon mb-4">
        <i class="bi bi-exclamation-triangle-fill text-glow-warning"></i>
      </div>
      
      <h1 class="error-title text-glow-primary mb-3">404</h1>
      
      <h3 class="error-subtitle text-glow-secondary mb-4">页面未找到</h3>
      
      <p class="error-description text-secondary mb-5">
        抱歉，您访问的页面不存在或已被移除。
        <br>
        请检查URL是否正确，或返回首页继续浏览。
      </p>
      
      <div class="error-actions">
        <button class="btn btn-glow me-3" @click="goHome">
          <i class="bi bi-house-fill me-2"></i>
          返回首页
        </button>
        <button class="btn btn-outline-secondary" @click="goBack">
          <i class="bi bi-arrow-left me-2"></i>
          返回上页
        </button>
      </div>
    </div>
    
    <!-- 装饰性背景元素 -->
    <div class="floating-elements">
      <div class="floating-element" v-for="i in 6" :key="i" :style="getFloatingStyle(i)">
        <i class="bi bi-lightning-charge"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 返回首页
const goHome = () => {
  router.push('/')
}

// 返回上一页
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

// 生成浮动元素样式
const getFloatingStyle = (index: number) => {
  const positions = [
    { top: '10%', left: '15%', animationDelay: '0s' },
    { top: '20%', right: '20%', animationDelay: '2s' },
    { top: '60%', left: '10%', animationDelay: '4s' },
    { bottom: '20%', right: '15%', animationDelay: '1s' },
    { bottom: '40%', left: '80%', animationDelay: '3s' },
    { top: '80%', left: '50%', animationDelay: '5s' }
  ]
  
  return {
    ...positions[index - 1],
    position: 'absolute',
    animationDelay: positions[index - 1].animationDelay
  }
}
</script>

<style lang="scss" scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: $spacing-lg;
}

.not-found-content {
  text-align: center;
  z-index: 2;
  max-width: 600px;
  
  .error-icon {
    font-size: 8rem;
    filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
    
    @media (max-width: $breakpoint-md) {
      font-size: 6rem;
    }
    
    @media (max-width: $breakpoint-sm) {
      font-size: 4rem;
    }
  }
  
  .error-title {
    font-size: 8rem;
    font-weight: 900;
    line-height: 1;
    text-shadow: $glow-strong;
    
    @media (max-width: $breakpoint-md) {
      font-size: 6rem;
    }
    
    @media (max-width: $breakpoint-sm) {
      font-size: 4rem;
    }
  }
  
  .error-subtitle {
    font-size: $font-size-title;
    font-weight: 700;
    
    @media (max-width: $breakpoint-sm) {
      font-size: $font-size-xl;
    }
  }
  
  .error-description {
    font-size: $font-size-lg;
    line-height: 1.6;
    max-width: 500px;
    margin: 0 auto $spacing-xl auto;
    
    @media (max-width: $breakpoint-sm) {
      font-size: $font-size-base;
      margin-bottom: $spacing-lg;
    }
  }
  
  .error-actions {
    display: flex;
    justify-content: center;
    gap: $spacing-md;
    flex-wrap: wrap;
    
    .btn {
      padding: $spacing-md $spacing-lg;
      font-size: $font-size-base;
      font-weight: 600;
      
      @media (max-width: $breakpoint-sm) {
        padding: $spacing-sm $spacing-md;
        font-size: $font-size-sm;
        flex: 1;
        min-width: 120px;
      }
    }
    
    .btn-outline-secondary {
      color: $text-secondary;
      border-color: $border-primary;
      
      &:hover {
        background: rgba(0, 212, 255, 0.1);
        border-color: $border-secondary;
        color: $text-glow;
      }
    }
  }
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  
  .floating-element {
    position: absolute;
    color: rgba(0, 212, 255, 0.3);
    font-size: 2rem;
    animation: float 6s ease-in-out infinite;
    
    @media (max-width: $breakpoint-md) {
      font-size: 1.5rem;
    }
  }
}

// 浮动动画
@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  25% {
    transform: translateY(-20px) rotate(90deg);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-10px) rotate(180deg);
    opacity: 0.8;
  }
  75% {
    transform: translateY(-30px) rotate(270deg);
    opacity: 0.4;
  }
}

// 响应式调整
@media (max-width: $breakpoint-sm) {
  .not-found-container {
    padding: $spacing-md;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
    gap: $spacing-sm !important;
  }
}
</style>
