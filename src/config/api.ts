/**
 * API Configuration
 * 
 * Update the NGROK_URL when you get a new ngrok tunnel
 */

// Render production backend URL
export const BACKEND_URL = 'https://paymebro-backend.onrender.com';

// API configuration
export const API_CONFIG = {
  baseUrl: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper function to make API calls
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('Expected JSON but got:', text.substring(0, 200));
    throw new Error('Server returned HTML instead of JSON. Check if the API endpoint exists.');
  }

  return response.json();
};

// WebSocket configuration
export const WEBSOCKET_CONFIG = {
  url: BACKEND_URL,
  options: {
    // No special headers needed for Railway
  }
};