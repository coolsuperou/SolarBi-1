import type { User, ApiResponse } from '@/types/user';
export interface UserQueryRequest {
    current?: number;
    pageSize?: number;
    keyword?: string;
    userRole?: string;
    userStatus?: number;
}
export interface UserCreateRequest {
    userAccount: string;
    userPassword: string;
    userName?: string;
    userRole: 'user' | 'admin';
    gender?: number;
    phone?: string;
    email?: string;
}
export interface UserUpdateRequest {
    id: number;
    userName?: string;
    userRole?: 'user' | 'admin';
    gender?: number;
    phone?: string;
    email?: string;
    userStatus?: number;
}
export declare const userApi: {
    getUserList(params: UserQueryRequest): Promise<ApiResponse<{
        records: User[];
        total: number;
        current: number;
        pageSize: number;
    }>>;
    createUser(data: UserCreateRequest): Promise<ApiResponse<number>>;
    updateUser(data: UserUpdateRequest): Promise<ApiResponse<boolean>>;
    deleteUser(id: number): Promise<ApiResponse<boolean>>;
    updateUserStatus(data: {
        id: number;
        userStatus: number;
    }): Promise<ApiResponse<boolean>>;
    resetPassword(data: {
        id: number;
        newPassword: string;
    }): Promise<ApiResponse<boolean>>;
    getUserById(id: number): Promise<ApiResponse<User>>;
    checkUserAccount(userAccount: string): Promise<ApiResponse<boolean>>;
};
