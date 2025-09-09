import { io, Socket } from 'socket.io-client';
import { appConfig } from '@/lib/config';

export interface PaymentUpdate {
  reference: string;
  status: 'pending' | 'confirmed' | 'failed';
  amount?: number;
  currency?: string;
  signature?: string;
}

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, (data: any) => void> = new Map();

  connect(userId?: string) {
    if (this.socket?.connected) return;

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

    this.socket.on('payment-update', (data: PaymentUpdate) => {
      console.log('💰 Payment update received:', data);
      const listener = this.listeners.get('payment-update');
      if (listener) listener(data);
    });

    this.socket.on('payment-confirmed', (data: any) => {
      console.log('✅ Payment confirmed:', data);
      const listener = this.listeners.get('payment-confirmed');
      if (listener) listener(data);
    });

    this.socket.on('error', (error: any) => {
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

  onPaymentUpdate(callback: (data: PaymentUpdate) => void) {
    console.log('👂 Listening for payment updates...');
    this.listeners.set('payment-update', callback);
  }

  onPaymentConfirmed(callback: (data: any) => void) {
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
