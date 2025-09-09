import { appConfig, getApiHeaders } from '@/lib/config';

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

export const usersApi = {
  async registerUser(userData: RegisterUserRequest): Promise<UserProfile> {
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

  async getUserProfile(web3AuthUserId: string): Promise<UserProfile | null> {
    try {
      const response = await fetch(
        `${appConfig.apiUrl}${appConfig.endpoints.users}/profile/${web3AuthUserId}`,
        {
          headers: getApiHeaders(web3AuthUserId),
        }
      );

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
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  },

  async completeOnboarding(onboardingData: CompleteOnboardingRequest): Promise<UserProfile> {
    const response = await fetch(`${appConfig.apiUrl}${appConfig.endpoints.users}/onboarding/complete`, {
      method: 'POST',
      headers: getApiHeaders(onboardingData.web3AuthUserId),
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

  async getOnboardingStatus(web3AuthUserId: string): Promise<{ completed: boolean }> {
    const response = await fetch(
      `${appConfig.apiUrl}${appConfig.endpoints.users}/onboarding/status/${web3AuthUserId}`,
      {
        headers: getApiHeaders(web3AuthUserId),
      }
    );

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
