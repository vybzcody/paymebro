/// <reference types="vite/client" />
export const appConfig = {
    apiUrl: (import.meta.env.VITE_API_URL || 'https://paymebro-backend.onrender.com').replace(/\/$/, ''),
    web3AuthClientId: import.meta.env.VITE_WEB3AUTH_CLIENT_ID || '',
    // API endpoints
    endpoints: {
        payments: '/api/payments',
        analytics: '/api/analytics',
        users: '/api/users',
        templates: '/api/templates',
        merchantAddresses: '/api/users',
        notifications: '/api/notifications',
        subscriptions: '/api/subscriptions',
    },
    // WebSocket configuration
    wsUrl: (import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL || 'https://paymebro-backend.onrender.com').replace(/\/$/, ''),
    // Feature flags
    features: {
        merchantAddresses: true,
        subscriptions: true,
        notifications: true,
        realTimeUpdates: true,
    }
};
// Helper to get headers with user ID
export const getApiHeaders = (userId) => ({
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(userId && { 'x-user-id': userId }),
});
