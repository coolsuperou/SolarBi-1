import { createRouter, createWebHistory } from 'vue-router';
// 路由配置
const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: {
            title: '登录',
            requiresAuth: false,
            layout: 'blank'
        }
    },
    {
        path: '/',
        component: () => import('@/layouts/MainLayout.vue'),
        meta: {
            requiresAuth: true
        },
        children: [
            {
                path: '',
                redirect: '/power-monitor'
            },
            {
                path: '/power-monitor',
                name: 'PowerMonitor',
                component: () => import('@/views/PowerMonitor.vue'),
                meta: {
                    title: '114_空调水机主机',
                    icon: 'building',
                    requiresAuth: true
                }
            },
            {
                path: '/user-management',
                name: 'UserManagement',
                component: () => import('@/views/UserManagement.vue'),
                meta: {
                    title: '用户管理',
                    icon: 'people-fill',
                    requiresAuth: true,
                    requiresAdmin: true
                }
            }
        ]
    },
    {
        path: '/404',
        name: 'NotFound',
        component: () => import('@/views/NotFound.vue'),
        meta: {
            title: '页面未找到',
            layout: 'blank'
        }
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/404'
    }
];
const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }
        else {
            return { top: 0 };
        }
    }
});
// 路由守卫
router.beforeEach(async (to, from, next) => {
    // 动态导入store避免循环依赖
    const { useAuthStore } = await import('@/stores/auth');
    const authStore = useAuthStore();
    // 设置页面标题
    if (to.meta.title) {
        document.title = `${to.meta.title} - 工具制造电能数据平台`;
    }
    // 检查是否需要登录
    if (to.meta.requiresAuth) {
        if (!authStore.isAuthenticated) {
            // 未登录，重定向到登录页
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            });
            return;
        }
        // 检查是否需要管理员权限
        if (to.meta.requiresAdmin && !authStore.isAdmin) {
            // 无权限，重定向到首页
            next('/');
            return;
        }
    }
    // 已登录用户访问登录页，重定向到首页
    if (to.path === '/login' && authStore.isAuthenticated) {
        next('/');
        return;
    }
    next();
});
export default router;
