import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { BACKEND_HOST_LOCAL, BACKEND_HOST_PROD } from '@/constants/backend';
// 选择后端基地址：优先环境变量，其次根据环境切换
const BASE_URL = import.meta.env?.VITE_API_BASE_URL ||
    (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) ||
    (import.meta.env.MODE === 'production' ? BACKEND_HOST_PROD : BACKEND_HOST_LOCAL);
// 创建axios实例
const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});
// 请求拦截器
instance.interceptors.request.use((config) => {
    // 添加token到请求头
    const authStore = useAuthStore();
    if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
}, (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
});
// 响应拦截器
instance.interceptors.response.use((response) => {
    const { data } = response;
    // 统一处理响应
    if (data.code === 0) {
        return data;
    }
    else {
        // 处理业务错误
        const errorMessage = data.message || '请求失败';
        console.error('API Error:', errorMessage);
        return Promise.reject(new Error(errorMessage));
    }
}, (error) => {
    // 处理HTTP错误
    if (error.response) {
        const { status, data } = error.response;
        switch (status) {
            case 401:
                // 未授权，清除登录状态
                const authStore = useAuthStore();
                authStore.logout();
                window.location.href = '/login';
                break;
            case 403:
                console.error('权限不足');
                break;
            case 404:
                console.error('请求的资源不存在');
                break;
            case 500:
                console.error('服务器内部错误');
                break;
            default:
                console.error(`请求失败: ${status}`);
        }
        return Promise.reject(new Error(data?.message || `HTTP Error: ${status}`));
    }
    else if (error.request) {
        console.error('网络错误，请检查网络连接');
        return Promise.reject(new Error('网络错误，请检查网络连接'));
    }
    else {
        console.error('请求配置错误:', error.message);
        return Promise.reject(error);
    }
});
// 导出http工具函数
export const http = {
    get(url, config) {
        return instance.get(url, config);
    },
    post(url, data, config) {
        return instance.post(url, data, config);
    },
    put(url, data, config) {
        return instance.put(url, data, config);
    },
    delete(url, config) {
        return instance.delete(url, config);
    },
    patch(url, data, config) {
        return instance.patch(url, data, config);
    }
};
export default instance;
