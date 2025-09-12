import { appConfig, getApiHeaders } from '@/lib/config';
export const webhooksApi = {
    async createWebhook(webhookData, userId) {
        const response = await fetch(`${appConfig.apiUrl}/api/webhooks`, {
            method: 'POST',
            headers: getApiHeaders(userId),
            body: JSON.stringify({
                ...webhookData,
                web3AuthUserId: userId,
            }),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to create webhook`);
        }
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to create webhook');
        }
        return result.webhook;
    },
    async getWebhooks(userId) {
        const response = await fetch(`${appConfig.apiUrl}/api/webhooks/user/${userId}`, {
            headers: getApiHeaders(userId),
        });
        if (!response.ok) {
            if (response.status === 404)
                return [];
            throw new Error(`HTTP ${response.status}: Failed to fetch webhooks`);
        }
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to fetch webhooks');
        }
        return result.webhooks || [];
    },
    async deleteWebhook(webhookId, userId) {
        const response = await fetch(`${appConfig.apiUrl}/api/webhooks/${webhookId}`, {
            method: 'DELETE',
            headers: getApiHeaders(userId),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to delete webhook`);
        }
        const result = await response.json();
        return result.success;
    },
    async testWebhook(webhookId, userId) {
        const response = await fetch(`${appConfig.apiUrl}/api/webhooks/${webhookId}/test`, {
            method: 'POST',
            headers: getApiHeaders(userId),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to test webhook`);
        }
        const result = await response.json();
        return result.success;
    },
};
