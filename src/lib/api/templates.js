import { appConfig, getApiHeaders } from '@/lib/config';
// Removed static template fallback - backend should handle empty states
export const templatesApi = {
    async getTemplates(userId) {
        try {
            const response = await fetch(`${appConfig.apiUrl}/api/templates/user/${userId}`, {
                headers: getApiHeaders(userId),
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch templates`);
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch templates');
            }
            return result.data || result.templates || [];
        }
        catch (error) {
            console.error('Templates API error:', error);
            return [];
        }
    },
    async createTemplate(templateData) {
        const response = await fetch(`${appConfig.apiUrl}/api/templates`, {
            method: 'POST',
            headers: getApiHeaders(templateData.web3AuthUserId),
            body: JSON.stringify(templateData),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to create template`);
        }
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to create template');
        }
        return result.data || result.template;
    },
    async updateTemplate(templateId, updates, userId) {
        const response = await fetch(`${appConfig.apiUrl}/api/templates/${templateId}`, {
            method: 'PUT',
            headers: getApiHeaders(userId),
            body: JSON.stringify(updates),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to update template`);
        }
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to update template');
        }
        return result.data || result.template;
    },
    async deleteTemplate(templateId, userId) {
        const response = await fetch(`${appConfig.apiUrl}/api/templates/${templateId}`, {
            method: 'DELETE',
            headers: getApiHeaders(userId),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to delete template`);
        }
        const result = await response.json();
        return result.success;
    },
    async createPaymentFromTemplate(templateId, customerEmail, userId) {
        const response = await fetch(`${appConfig.apiUrl}/api/templates/${templateId}/create-payment`, {
            method: 'POST',
            headers: getApiHeaders(userId),
            body: JSON.stringify({ customerEmail }),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to create payment from template`);
        }
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to create payment from template');
        }
        return result;
    },
};
