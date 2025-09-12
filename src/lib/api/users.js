import { appConfig, getApiHeaders } from '@/lib/config';
export const usersApi = {
    async registerUser(userData) {
        const response = await fetch(`${appConfig.apiUrl}${appConfig.endpoints.users}/register`, {
            method: 'POST',
            headers: getApiHeaders(),
            body: JSON.stringify(userData),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to register user`);
        }
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to register user');
        }
        return result.user;
    },
    async getUserProfile(web3AuthUserId) {
        try {
            const response = await fetch(`${appConfig.apiUrl}${appConfig.endpoints.users}/profile/${web3AuthUserId}`, {
                headers: getApiHeaders(web3AuthUserId),
            });
            if (!response.ok) {
                if (response.status === 404) {
                    return null; // User not found
                }
                throw new Error(`HTTP ${response.status}: Failed to get user profile`);
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to get user profile');
            }
            return result.user;
        }
        catch (error) {
            console.error('Get user profile error:', error);
            return null;
        }
    },
    async completeOnboarding(onboardingData) {
        const response = await fetch(`${appConfig.apiUrl}${appConfig.endpoints.users}/onboarding/complete`, {
            method: 'POST',
            headers: getApiHeaders(onboardingData.web3auth_user_id),
            body: JSON.stringify(onboardingData),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to complete onboarding`);
        }
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to complete onboarding');
        }
        return result.user;
    },
    async getOnboardingStatus(web3AuthUserId) {
        const response = await fetch(`${appConfig.apiUrl}${appConfig.endpoints.users}/onboarding/status/${web3AuthUserId}`, {
            headers: getApiHeaders(web3AuthUserId),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to get onboarding status`);
        }
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to get onboarding status');
        }
        return { completed: result.onboardingCompleted };
    },
};
