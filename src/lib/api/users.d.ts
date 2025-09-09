export interface UserProfile {
    web3AuthUserId: string;
    email: string;
    name: string;
    businessName?: string;
    businessType?: string;
    solanaAddress?: string;
    ethereumAddress?: string;
    onboardingCompleted: boolean;
}
export interface RegisterUserRequest {
    web3AuthUserId: string;
    email: string;
    solanaAddress: string;
    ethereumAddress: string;
}
export interface CompleteOnboardingRequest {
    web3AuthUserId: string;
    firstName: string;
    lastName: string;
    businessName: string;
    phoneNumber?: string;
    country?: string;
}
export declare const usersApi: {
    registerUser(userData: RegisterUserRequest): Promise<UserProfile>;
    getUserProfile(web3AuthUserId: string): Promise<UserProfile | null>;
    completeOnboarding(onboardingData: CompleteOnboardingRequest): Promise<UserProfile>;
    getOnboardingStatus(web3AuthUserId: string): Promise<{
        completed: boolean;
    }>;
};
//# sourceMappingURL=users.d.ts.map