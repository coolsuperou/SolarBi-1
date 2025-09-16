import { http } from '@/utils/http';
export const authApi = {
    // 用户登录
    login(data) {
        return http.post('/api/user/login', data);
    },
    // 获取当前用户信息
    getCurrentUser() {
        return http.get('/api/user/get/login');
    },
    // 用户注册
    register(data) {
        return http.post('/api/user/register', data);
    },
    // 用户登出
    logout() {
        return http.post('/api/user/logout');
    }
};
