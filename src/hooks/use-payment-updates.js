import { useEffect, useState } from 'react';
import { useWebSocket } from '@/components/providers/websocket-provider';
export function usePaymentUpdates(reference, onUpdate) {
    const { socket, isConnected, joinPayment, leavePayment } = useWebSocket();
    const [lastUpdate, setLastUpdate] = useState(null);
    useEffect(() => {
        if (!socket || !isConnected || !reference)
            return;
        // Join payment room for updates
        joinPayment(reference);
        // Listen for payment updates
        const handlePaymentUpdate = (update) => {
            if (update.reference === reference) {
                setLastUpdate(update);
                onUpdate?.(update);
            }
        };
        socket.on('payment-update', handlePaymentUpdate);
        return () => {
            socket.off('payment-update', handlePaymentUpdate);
            leavePayment(reference);
        };
    }, [socket, isConnected, reference, joinPayment, leavePayment, onUpdate]);
    return { lastUpdate, isConnected };
}
