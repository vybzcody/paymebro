import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { appConfig } from '@/lib/config';
const WebSocketContext = createContext({
    socket: null,
    isConnected: false,
    isAuthenticated: false,
    isConnecting: false,
    connectionError: null,
    joinPayment: async () => false,
    leavePayment: async () => false,
    authenticate: async () => false,
    reconnect: () => { },
});
export const useWebSocket = () => useContext(WebSocketContext);
export function WebSocketProvider({ children, userId }) {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;
    useEffect(() => {
        if (!userId)
            return;
        setIsConnecting(true);
        setConnectionError(null);
        const socketInstance = io(appConfig.apiUrl, {
            transports: ['polling'], // Use polling only for Railway compatibility
            timeout: 20000,
            reconnection: false, // Disable auto-reconnection to prevent spam
        });
        const authenticateSocket = async () => {
            if (!socketInstance || !userId)
                return false;
            return new Promise((resolve) => {
                socketInstance.emit('authenticate', userId, (response) => {
                    if (response?.success && response?.token) {
                        setAuthToken(response.token);
                        setIsAuthenticated(true);
                        setConnectionError(null);
                        console.log('WebSocket authentication successful');
                        resolve(true);
                    }
                    else {
                        console.error('WebSocket authentication failed:', response?.error);
                        setIsAuthenticated(false);
                        setAuthToken(null);
                        resolve(false);
                    }
                });
            });
        };
        socketInstance.on('connect', () => {
            console.log('WebSocket connected');
            setIsConnected(true);
            setIsConnecting(false);
            setConnectionError(null);
            authenticateSocket();
        });
        socketInstance.on('disconnect', (reason) => {
            console.log('WebSocket disconnected:', reason);
            setIsConnected(false);
            setIsAuthenticated(false);
            setAuthToken(null);
        });
        socketInstance.on('connect_error', (error) => {
            console.warn('WebSocket connection failed, continuing without real-time updates:', error.message);
            setIsConnected(false);
            setIsConnecting(false);
            setIsAuthenticated(false);
            setAuthToken(null);
            setConnectionError('Real-time updates unavailable');
        });
        setSocket(socketInstance);
        return () => {
            socketInstance.disconnect();
        };
    }, [userId]);
    // Authenticate function
    const authenticate = useCallback(async () => {
        if (!socket || !userId || !isConnected) {
            return false;
        }
        return new Promise((resolve) => {
            socket.emit('authenticate', userId, (response) => {
                if (response?.success && response?.token) {
                    setAuthToken(response.token);
                    setIsAuthenticated(true);
                    setConnectionError(null);
                    resolve(true);
                }
                else {
                    setIsAuthenticated(false);
                    setAuthToken(null);
                    resolve(false);
                }
            });
        });
    }, [socket, userId, isConnected]);
    // Reconnect function
    const reconnect = useCallback(() => {
        if (socket) {
            socket.disconnect();
            socket.connect();
        }
    }, [socket]);
    const joinPayment = useCallback(async (reference) => {
        if (!socket || !isConnected) {
            console.warn('Cannot join payment room: not connected');
            return false;
        }
        return new Promise((resolve) => {
            // If authenticated, use the auth token, otherwise join without it (backward compatibility)
            if (isAuthenticated && authToken) {
                socket.emit('join-payment', reference, authToken, (response) => {
                    if (response?.success) {
                        console.log(`Successfully joined payment room for ${reference}`);
                        resolve(true);
                    }
                    else {
                        console.error(`Failed to join payment room for ${reference}:`, response?.error);
                        resolve(false);
                    }
                });
            }
            else {
                socket.emit('join-payment', reference, undefined, (response) => {
                    if (response?.success) {
                        console.log(`Successfully joined payment room for ${reference} (no auth)`);
                        resolve(true);
                    }
                    else {
                        console.error(`Failed to join payment room for ${reference}:`, response?.error);
                        resolve(false);
                    }
                });
            }
        });
    }, [socket, isConnected, isAuthenticated, authToken]);
    const leavePayment = useCallback(async (reference) => {
        if (!socket || !isConnected) {
            console.warn('Cannot leave payment room: not connected');
            return false;
        }
        return new Promise((resolve) => {
            // If authenticated, use the auth token, otherwise leave without it (backward compatibility)
            if (isAuthenticated && authToken) {
                socket.emit('leave-payment', reference, authToken, (response) => {
                    if (response?.success) {
                        console.log(`Successfully left payment room for ${reference}`);
                        resolve(true);
                    }
                    else {
                        console.error(`Failed to leave payment room for ${reference}:`, response?.error);
                        resolve(false);
                    }
                });
            }
            else {
                socket.emit('leave-payment', reference, undefined, (response) => {
                    if (response?.success) {
                        console.log(`Successfully left payment room for ${reference} (no auth)`);
                        resolve(true);
                    }
                    else {
                        console.error(`Failed to leave payment room for ${reference}:`, response?.error);
                        resolve(false);
                    }
                });
            }
        });
    }, [socket, isConnected, isAuthenticated, authToken]);
    return (_jsx(WebSocketContext.Provider, { value: {
            socket,
            isConnected,
            isAuthenticated,
            isConnecting,
            connectionError,
            joinPayment,
            leavePayment,
            authenticate,
            reconnect
        }, children: children }));
}
