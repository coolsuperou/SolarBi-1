export interface User {
    id?: number;
    userAccount: string;
    userName?: string;
    userAvatar?: string;
    userRole: 'user' | 'admin';
    gender?: number;
    phone?: string;
    email?: string;
    userStatus?: number;
    createTime?: string;
    updateTime?: string;
}
export interface LoginRequest {
    userAccount: string;
    userPassword: string;
}
export interface LoginResponse {
    token?: string;
    user: User;
}
export interface ApiResponse<T = any> {
    code: number;
    data?: T;
    message?: string;
}
