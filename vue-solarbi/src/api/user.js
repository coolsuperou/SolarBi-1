import { http } from '@/utils/http';
export const userApi = {
    // 获取用户列表（使用 /api/user/list/page，返回实体包含 userAccount）
    getUserList(params) {
        const payload = {
            current: params.current,
            pageSize: params.pageSize,
            // 关键字按后端可用字段映射到 userName 做模糊
            userName: params.keyword || undefined,
            userRole: params.userRole || undefined
        };
        return http.post('/api/user/list/page', payload);
    },
    // 创建用户
    createUser(data) {
        return http.post('/api/user/add', data);
    },
    // 更新用户
    updateUser(data) {
        return http.post('/api/user/update', data);
    },
    // 删除用户
    deleteUser(id) {
        return http.post('/api/user/delete', { id });
    },
    // 更新用户状态
    updateUserStatus(data) {
        return http.post('/api/user/update/status', data);
    },
    // 重置用户密码
    resetPassword(data) {
        return http.post('/api/user/reset/password', data);
    },
    // 获取用户详情
    getUserById(id) {
        return http.get(`/api/user/get/${id}`);
    },
    // 检查用户账号是否存在
    checkUserAccount(userAccount) {
        return http.get('/api/user/check/account', { params: { userAccount } });
    }
};
