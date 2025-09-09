import { createContext, useContext, useEffect, ReactNode } from 'react';
import { websocketService, PaymentUpdate } from '@/lib/services/websocket';
import { useToast } from '@/hooks/use-toast';

interface WebSocketContextType {
  onPaymentUpdate: (callback: (data: PaymentUpdate) => void) => void;
  offPaymentUpdate: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
  userId?: string;
}

export function WebSocketProvider({ children, userId }: WebSocketProviderProps) {
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      websocketService.connect(userId);

      // Default payment update handler
      websocketService.onPaymentUpdate((data: PaymentUpdate) => {
        toast({
          title: "Payment Update",
          description: `Payment ${data.reference} is now ${data.status}`,
          variant: data.status === 'confirmed' ? 'default' : 'destructive',
        });
      });
    }

    return () => {
      websocketService.disconnect();
    };
  }, [userId, toast]);

  const contextValue: WebSocketContextType = {
    onPaymentUpdate: websocketService.onPaymentUpdate.bind(websocketService),
    offPaymentUpdate: websocketService.offPaymentUpdate.bind(websocketService),
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}
