import { useEffect, useState } from 'react';
import { useWebSocket } from '@/components/providers/websocket-provider';

interface PaymentUpdate {
  reference: string;
  status: 'pending' | 'confirmed' | 'failed';
  amount?: number;
  currency?: string;
  timestamp?: string;
}

export function usePaymentUpdates(reference?: string) {
  const { socket, isConnected, joinPayment, leavePayment } = useWebSocket();
  const [lastUpdate, setLastUpdate] = useState<PaymentUpdate | null>(null);

  useEffect(() => {
    if (!socket || !isConnected || !reference) return;

    // Join payment room for updates
    joinPayment(reference);

    // Listen for payment updates
    const handlePaymentUpdate = (update: PaymentUpdate) => {
      if (update.reference === reference) {
        setLastUpdate(update);
      }
    };

    socket.on('payment-update', handlePaymentUpdate);

    return () => {
      socket.off('payment-update', handlePaymentUpdate);
      leavePayment(reference);
    };
  }, [socket, isConnected, reference, joinPayment, leavePayment]);

  return { lastUpdate, isConnected };
}
