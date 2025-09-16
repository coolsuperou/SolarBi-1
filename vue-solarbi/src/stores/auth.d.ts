import type { User } from '@/types/user';
export declare const useAuthStore: import("pinia").StoreDefinition<"auth", Pick<{
    user: import("vue").Ref<{
        id?: number | undefined;
        userAccount: string;
        userName?: string | undefined;
        userAvatar?: string | undefined;
        userRole: "user" | "admin";
        gender?: number | undefined;
        phone?: string | undefined;
        email?: string | undefined;
        userStatus?: number | undefined;
        createTime?: string | undefined;
        updateTime?: string | undefined;
    } | null, User | {
        id?: number | undefined;
        userAccount: string;
        userName?: string | undefined;
        userAvatar?: string | undefined;
        userRole: "user" | "admin";
        gender?: number | undefined;
        phone?: string | undefined;
        email?: string | undefined;
        userStatus?: number | undefined;
        createTime?: string | undefined;
        updateTime?: string | undefined;
    } | null>;
    token: import("vue").Ref<string | null, string | null>;
    isAuthenticated: import("vue").ComputedRef<boolean>;
    isAdmin: import("vue").ComputedRef<boolean>;
    login: (credentials: {
        userAccount: string;
        userPassword: string;
    }) => Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    logout: () => Promise<void>;
    initAuth: () => Promise<void>;
    getCurrentUser: () => Promise<void>;
}, "user" | "token">, Pick<{
    user: import("vue").Ref<{
        id?: number | undefined;
        userAccount: string;
        userName?: string | undefined;
        userAvatar?: string | undefined;
        userRole: "user" | "admin";
        gender?: number | undefined;
        phone?: string | undefined;
        email?: string | undefined;
        userStatus?: number | undefined;
        createTime?: string | undefined;
        updateTime?: string | undefined;
    } | null, User | {
        id?: number | undefined;
        userAccount: string;
        userName?: string | undefined;
        userAvatar?: string | undefined;
        userRole: "user" | "admin";
        gender?: number | undefined;
        phone?: string | undefined;
        email?: string | undefined;
        userStatus?: number | undefined;
        createTime?: string | undefined;
        updateTime?: string | undefined;
    } | null>;
    token: import("vue").Ref<string | null, string | null>;
    isAuthenticated: import("vue").ComputedRef<boolean>;
    isAdmin: import("vue").ComputedRef<boolean>;
    login: (credentials: {
        userAccount: string;
        userPassword: string;
    }) => Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    logout: () => Promise<void>;
    initAuth: () => Promise<void>;
    getCurrentUser: () => Promise<void>;
}, "isAuthenticated" | "isAdmin">, Pick<{
    user: import("vue").Ref<{
        id?: number | undefined;
        userAccount: string;
        userName?: string | undefined;
        userAvatar?: string | undefined;
        userRole: "user" | "admin";
        gender?: number | undefined;
        phone?: string | undefined;
        email?: string | undefined;
        userStatus?: number | undefined;
        createTime?: string | undefined;
        updateTime?: string | undefined;
    } | null, User | {
        id?: number | undefined;
        userAccount: string;
        userName?: string | undefined;
        userAvatar?: string | undefined;
        userRole: "user" | "admin";
        gender?: number | undefined;
        phone?: string | undefined;
        email?: string | undefined;
        userStatus?: number | undefined;
        createTime?: string | undefined;
        updateTime?: string | undefined;
    } | null>;
    token: import("vue").Ref<string | null, string | null>;
    isAuthenticated: import("vue").ComputedRef<boolean>;
    isAdmin: import("vue").ComputedRef<boolean>;
    login: (credentials: {
        userAccount: string;
        userPassword: string;
    }) => Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    logout: () => Promise<void>;
    initAuth: () => Promise<void>;
    getCurrentUser: () => Promise<void>;
}, "login" | "logout" | "initAuth" | "getCurrentUser">>;
