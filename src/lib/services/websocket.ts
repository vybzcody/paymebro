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

    this.socket = io(appConfig.apiUrl, {
      transports: ['websocket'],
      query: userId ? { userId } : undefined,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('payment-update', (data: PaymentUpdate) => {
      const listener = this.listeners.get('payment-update');
      if (listener) listener(data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onPaymentUpdate(callback: (data: PaymentUpdate) => void) {
    this.listeners.set('payment-update', callback);
  }

  offPaymentUpdate() {
    this.listeners.delete('payment-update');
  }
}

export const websocketService = new WebSocketService();
