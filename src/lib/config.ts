export const appConfig = {
  apiUrl: (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, ''),
  web3AuthClientId: import.meta.env.VITE_WEB3AUTH_CLIENT_ID || '',
  
  // API endpoints
  endpoints: {
    payments: '/api/payments',
    analytics: '/api/analytics', 
    users: '/api/users',
    templates: '/api/templates',
  }
};

// Helper to get headers with user ID
export const getApiHeaders = (userId?: string) => ({
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
  ...(userId && { 'x-user-id': userId }),
});
