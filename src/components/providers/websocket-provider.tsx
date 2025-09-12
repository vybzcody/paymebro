import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { appConfig } from '@/lib/config';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isAuthenticated: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  joinPayment: (reference: string) => Promise<boolean>;
  leavePayment: (reference: string) => Promise<boolean>;
  authenticate: () => Promise<boolean>;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  isAuthenticated: false,
  isConnecting: false,
  connectionError: null,
  joinPayment: async () => false,
  leavePayment: async () => false,
  authenticate: async () => false,
  reconnect: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export function WebSocketProvider({ children, userId }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!userId) return;

    setIsConnecting(true);
    setConnectionError(null);

    const socketInstance = io(appConfig.wsUrl, {
      transports: ['websocket', 'polling'], // Use both WebSocket and polling for better compatibility
      timeout: 20000,
      reconnection: true, // Enable auto-reconnection
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    const authenticateSocket = async () => {
      if (!socketInstance || !userId) return false;

      return new Promise<boolean>((resolve) => {
        socketInstance.emit('authenticate', userId, (response: any) => {
          if (response?.success && response?.token) {
            setAuthToken(response.token);
            setIsAuthenticated(true);
            setConnectionError(null);
            console.log('WebSocket authentication successful');
            resolve(true);
          } else {
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
      
      // If it's a forced disconnection, don't show error
      if (reason !== 'io client disconnect' && reason !== 'io server disconnect') {
        setConnectionError('Disconnected');
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.warn('WebSocket connection failed:', error.message);
      console.warn('Error details:', error);
      setIsConnected(false);
      setIsConnecting(false);
      setIsAuthenticated(false);
      setAuthToken(null);
      // Don't set connectionError here to allow reconnection attempts
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed after all attempts');
      setConnectionError('Real-time updates unavailable');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [userId]);

  // Authenticate function
  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!socket || !userId || !isConnected) {
      console.warn('Cannot authenticate: missing socket, userId, or not connected');
      return false;
    }

    console.log('Attempting WebSocket authentication for user:', userId);

    return new Promise((resolve) => {
      socket.emit('authenticate', userId, (response: any) => {
        console.log('Authentication response:', response);
        if (response?.success && response?.token) {
          setAuthToken(response.token);
          setIsAuthenticated(true);
          setConnectionError(null);
          console.log('WebSocket authentication successful');
          resolve(true);
        } else {
          console.error('WebSocket authentication failed:', response?.error);
          setIsAuthenticated(false);
          setAuthToken(null);
          resolve(false);
        }
      });
    });
  }, [socket, userId, isConnected]);

  // Reconnect function
  const reconnect = useCallback(() => {
    console.log('Attempting WebSocket reconnection');
    setConnectionError(null); // Clear any previous errors
    if (socket) {
      socket.disconnect();
      socket.connect();
    }
  }, [socket]);

  const joinPayment = useCallback(async (reference: string): Promise<boolean> => {
    if (!socket || !isConnected) {
      console.warn('Cannot join payment room: not connected');
      return false;
    }

    return new Promise((resolve) => {
      // If authenticated, use the auth token, otherwise join without it (backward compatibility)
      if (isAuthenticated && authToken) {
        socket.emit('join-payment', reference, authToken, (response: any) => {
          if (response?.success) {
            console.log(`Successfully joined payment room for ${reference}`);
            resolve(true);
          } else {
            console.error(`Failed to join payment room for ${reference}:`, response?.error);
            resolve(false);
          }
        });
      } else {
        socket.emit('join-payment', reference, undefined, (response: any) => {
          if (response?.success) {
            console.log(`Successfully joined payment room for ${reference} (no auth)`);
            resolve(true);
          } else {
            console.error(`Failed to join payment room for ${reference}:`, response?.error);
            resolve(false);
          }
        });
      }
    });
  }, [socket, isConnected, isAuthenticated, authToken]);

  const leavePayment = useCallback(async (reference: string): Promise<boolean> => {
    if (!socket || !isConnected) {
      console.warn('Cannot leave payment room: not connected');
      return false;
    }

    return new Promise((resolve) => {
      // If authenticated, use the auth token, otherwise leave without it (backward compatibility)
      if (isAuthenticated && authToken) {
        socket.emit('leave-payment', reference, authToken, (response: any) => {
          if (response?.success) {
            console.log(`Successfully left payment room for ${reference}`);
            resolve(true);
          } else {
            console.error(`Failed to leave payment room for ${reference}:`, response?.error);
            resolve(false);
          }
        });
      } else {
        socket.emit('leave-payment', reference, undefined, (response: any) => {
          if (response?.success) {
            console.log(`Successfully left payment room for ${reference} (no auth)`);
            resolve(true);
          } else {
            console.error(`Failed to leave payment room for ${reference}:`, response?.error);
            resolve(false);
          }
        });
      }
    });
  }, [socket, isConnected, isAuthenticated, authToken]);

  return (
    <WebSocketContext.Provider value={{ 
      socket, 
      isConnected, 
      isAuthenticated,
      isConnecting,
      connectionError,
      joinPayment, 
      leavePayment,
      authenticate,
      reconnect
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}
