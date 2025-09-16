import type { LoginRequest, LoginResponse, User, ApiResponse } from '@/types/user';
export declare const authApi: {
    login(data: LoginRequest): Promise<ApiResponse<LoginResponse>>;
    getCurrentUser(): Promise<ApiResponse<User>>;
    register(data: {
        userAccount: string;
        userPassword: string;
        checkPassword: string;
    }): Promise<ApiResponse<number>>;
    logout(): Promise<ApiResponse<boolean>>;
};
