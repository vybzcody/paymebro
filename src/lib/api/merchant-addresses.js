import { appConfig, getApiHeaders } from '@/lib/config';
export const merchantAddressesApi = {
    async getUserAddresses(userId) {
        try {
            const response = await fetch(`${appConfig.apiUrl}/api/users/${userId}/addresses`, {
                headers: getApiHeaders(userId),
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch merchant addresses`);
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch merchant addresses');
            }
            return result.addresses || [];
        }
        catch (error) {
            console.error('Merchant addresses API error:', error);
            return [];
        }
    },
    async addAddress(userId, addressData) {
        const response = await fetch(`${appConfig.apiUrl}/api/users/${userId}/addresses`, {
            method: 'POST',
            headers: getApiHeaders(userId),
            body: JSON.stringify(addressData),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to add merchant address`);
        }
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to add merchant address');
        }
        return result.address;
    },
    async updateAddress(userId, addressId, updates) {
        const response = await fetch(`${appConfig.apiUrl}/api/users/${userId}/addresses/${addressId}`, {
            method: 'PUT',
            headers: getApiHeaders(userId),
            body: JSON.stringify(updates),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to update merchant address`);
        }
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to update merchant address');
        }
        return result.address;
    },
    async deleteAddress(userId, addressId) {
        const response = await fetch(`${appConfig.apiUrl}/api/users/${userId}/addresses/${addressId}`, {
            method: 'DELETE',
            headers: getApiHeaders(userId),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to delete merchant address`);
        }
        const result = await response.json();
        return result.success;
    },
    async setDefaultAddress(userId, addressId) {
        const response = await fetch(`${appConfig.apiUrl}/api/users/${userId}/addresses/${addressId}/set-default`, {
            method: 'POST',
            headers: getApiHeaders(userId),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to set default address`);
        }
        const result = await response.json();
        return result.success;
    },
    async validateAddress(address, network) {
        try {
            const response = await fetch(`${appConfig.apiUrl}/api/addresses/validate`, {
                method: 'POST',
                headers: getApiHeaders(),
                body: JSON.stringify({ address, network }),
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to validate address`);
            }
            const result = await response.json();
            return {
                valid: result.success && result.valid,
                error: result.error
            };
        }
        catch (error) {
            console.error('Address validation error:', error);
            return {
                valid: false,
                error: 'Failed to validate address'
            };
        }
    },
};
