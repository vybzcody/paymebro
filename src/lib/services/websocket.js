import { io } from 'socket.io-client';
import { appConfig } from '@/lib/config';
class WebSocketService {
    constructor() {
        Object.defineProperty(this, "socket", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    connect(userId) {
        if (this.socket?.connected)
            return;
        console.log('🔌 Connecting to WebSocket server...', { userId });
        this.socket = io(appConfig.apiUrl, {
            transports: ['websocket'],
            query: userId ? { userId } : undefined,
        });
        this.socket.on('connect', () => {
            console.log('✅ WebSocket connected successfully');
        });
        this.socket.on('disconnect', () => {
            console.log('❌ WebSocket disconnected');
        });
        this.socket.on('payment-update', (data) => {
            console.log('💰 Payment update received:', data);
            const listener = this.listeners.get('payment-update');
            if (listener)
                listener(data);
        });
        this.socket.on('payment-confirmed', (data) => {
            console.log('✅ Payment confirmed:', data);
            const listener = this.listeners.get('payment-confirmed');
            if (listener)
                listener(data);
        });
        this.socket.on('error', (error) => {
            console.error('🚨 WebSocket error:', error);
        });
    }
    disconnect() {
        if (this.socket) {
            console.log('🔌 Disconnecting WebSocket...');
            this.socket.disconnect();
            this.socket = null;
        }
    }
    onPaymentUpdate(callback) {
        console.log('👂 Listening for payment updates...');
        this.listeners.set('payment-update', callback);
    }
    onPaymentConfirmed(callback) {
        console.log('👂 Listening for payment confirmations...');
        this.listeners.set('payment-confirmed', callback);
    }
    offPaymentUpdate() {
        this.listeners.delete('payment-update');
    }
    offPaymentConfirmed() {
        this.listeners.delete('payment-confirmed');
    }
}
export const websocketService = new WebSocketService();
