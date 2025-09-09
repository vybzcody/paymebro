import { User } from '@shared/schema';
export declare const useAuth: () => {
    user: any;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: () => Promise<{
        user: User;
        isNewUser: boolean;
    }>;
    logout: () => Promise<void>;
    setUser: import("react").Dispatch<any>;
};
//# sourceMappingURL=use-auth.d.ts.map