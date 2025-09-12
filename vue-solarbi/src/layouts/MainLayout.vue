<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <nav class="navbar navbar-expand-lg navbar-tech fixed-top">
      <div class="container-fluid">
        <!-- Logo和标题 -->
        <div class="navbar-brand d-flex align-items-center">
          <div class="brand-icon me-2">
            <i class="bi bi-lightning-charge-fill text-glow-primary" style="font-size: 1.8rem;"></i>
          </div>
          <span class="brand-text text-glow-primary fw-bold">工具制造电能数据平台</span>
        </div>

        <!-- 移动端菜单按钮 -->
        <button 
          class="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <i class="bi bi-list text-glow-primary" style="font-size: 1.5rem;"></i>
        </button>

        <!-- 导航菜单 -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item" v-for="route in navigationRoutes" :key="route.path">
              <router-link 
                :to="route.path" 
                class="nav-link fw-semibold"
                :class="{ 'active': $route.path === route.path }"
              >
                <i :class="`bi bi-${route.meta.icon} me-1`"></i>
                {{ route.meta.title }}
              </router-link>
            </li>
          </ul>

          <!-- 用户菜单 -->
          <div class="navbar-nav">
            <div class="nav-item dropdown">
              <a 
                class="nav-link dropdown-toggle d-flex align-items-center text-glow-primary fw-semibold" 
                href="#" 
                role="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                <div class="user-avatar me-2">
                  <i class="bi bi-person-circle" style="font-size: 1.5rem;"></i>
                </div>
                {{ authStore.user?.userName || authStore.user?.userAccount }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end tech-dropdown">
                <li>
                  <span class="dropdown-item-text text-glow-secondary">
                    <i class="bi bi-shield-check me-2"></i>
                    {{ authStore.user?.userRole === 'admin' ? '管理员' : '普通用户' }}
                  </span>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <button class="dropdown-item text-danger" @click="handleLogout">
                    <i class="bi bi-box-arrow-right me-2"></i>
                    退出登录
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区域 -->
    <main class="main-content">
      <div class="container-fluid py-4">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 获取导航路由
const navigationRoutes = computed(() => {
  const basicRoutes = router.getRoutes()
    .filter(route => route.meta?.title && route.meta?.icon && !route.meta?.requiresAdmin)
    
  if (authStore.isAdmin) {
    const adminRoutes = router.getRoutes().filter(route => route.meta?.requiresAdmin)
    return [...basicRoutes, ...adminRoutes]
  }
  
  return basicRoutes
})

// 退出登录
const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

onMounted(() => {
  // 初始化认证状态
  authStore.initAuth()
})
</script>

<style lang="scss" scoped>
.main-layout {
  min-height: 100vh;
  padding-top: 80px; // 为固定导航栏留出空间
}

.navbar-tech {
  background: linear-gradient(135deg, rgba(10, 25, 41, 0.95), rgba(26, 35, 126, 0.9));
  border-bottom: 2px solid $border-primary;
  backdrop-filter: blur(15px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  
  .navbar-brand {
    .brand-icon {
      filter: drop-shadow($glow-primary);
    }
    
    .brand-text {
      font-size: 1.2rem;
      
      @media (max-width: 768px) {
        font-size: 1rem;
      }
    }
  }
  
  .nav-link {
    color: $text-secondary !important;
    transition: all 0.3s ease;
    border-radius: $border-radius-md;
    margin: 0 0.25rem;
    
    &:hover {
      color: $text-glow !important;
      text-shadow: $glow-primary;
      background: rgba(0, 212, 255, 0.1);
    }
    
    &.active {
      color: $text-glow !important;
      text-shadow: $glow-primary;
      background: rgba(0, 212, 255, 0.15);
      font-weight: 700;
    }
  }
  
  .navbar-toggler {
    &:focus {
      box-shadow: none;
    }
  }
}

.tech-dropdown {
  background: linear-gradient(135deg, $bg-card, $bg-table);
  border: 2px solid $border-primary;
  border-radius: $border-radius-md;
  box-shadow: $shadow-card, $glow-primary;
  backdrop-filter: blur(10px);
  
  .dropdown-item {
    color: $text-primary;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(0, 212, 255, 0.1);
      color: $text-glow;
    }
    
    &.text-danger:hover {
      background: rgba(255, 61, 113, 0.1);
      color: $danger-color;
    }
  }
  
  .dropdown-item-text {
    color: $text-secondary;
  }
  
  .dropdown-divider {
    border-color: $border-primary;
  }
}

.main-content {
  flex: 1;
  padding-bottom: $spacing-xl;
}

.user-avatar {
  filter: drop-shadow($glow-primary);
}

// 响应式调整
@media (max-width: 992px) {
  .navbar-nav {
    text-align: center;
    
    .nav-item {
      margin: 0.25rem 0;
    }
  }
}

@media (max-width: 576px) {
  .main-layout {
    padding-top: 70px;
  }
  
  .navbar-tech {
    .container-fluid {
      padding: 0.5rem 1rem;
    }
  }
}
</style>
