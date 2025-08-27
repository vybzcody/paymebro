import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AfriPayAPI } from '@/services/afripayAPI';

export interface TransactionNotification {
  id: string;
  type: 'payment_received' | 'payment_confirmed' | 'payment_failed' | 'payment_expired';
  title: string;
  message: string;
  timestamp: Date;
  reference?: string;
  signature?: string;
  amount?: number;
  currency?: string;
  read: boolean;
}

export interface TransactionStatusUpdate {
  reference: string;
  status: 'pending' | 'confirmed' | 'failed' | 'expired';
  signature?: string;
  timestamp: Date;
  amount?: number;
  currency?: string;
}

/**
 * Real-time transaction notification system for Stripe-like experience
 * Provides webhooks/polling functionality for transaction status updates
 */
export const useTransactionNotifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<TransactionNotification[]>([]);
  const [monitoringReferences, setMonitoringReferences] = useState<Set<string>>(new Set());
  const [isMonitoring, setIsMonitoring] = useState(false);

  /**
   * Add a payment reference to monitor for status updates
   */
  const monitorPayment = useCallback((reference: string, initialAmount?: number, currency?: string) => {
    setMonitoringReferences(prev => new Set(prev).add(reference));
    
    console.log(`🔍 Starting monitoring for payment reference: ${reference}`);
    
    // Create initial notification
    const initialNotification: TransactionNotification = {
      id: `pending_${reference}`,
      type: 'payment_received',
      title: 'Payment Request Created',
      message: `Waiting for payment${initialAmount ? ` of ${initialAmount} ${currency || 'USDC'}` : ''}`,
      timestamp: new Date(),
      reference,
      amount: initialAmount,
      currency,
      read: false,
    };

    setNotifications(prev => [initialNotification, ...prev]);
  }, []);

  /**
   * Stop monitoring a payment reference
   */
  const stopMonitoring = useCallback((reference: string) => {
    setMonitoringReferences(prev => {
      const newSet = new Set(prev);
      newSet.delete(reference);
      return newSet;
    });
    
    console.log(`⏹️ Stopped monitoring payment reference: ${reference}`);
  }, []);

  /**
   * Process transaction status update
   */
  const processStatusUpdate = useCallback((update: TransactionStatusUpdate) => {
    console.log('📬 Processing transaction status update:', update);

    let notification: TransactionNotification;

    switch (update.status) {
      case 'confirmed':
        notification = {
          id: `confirmed_${update.reference}_${Date.now()}`,
          type: 'payment_confirmed',
          title: '✅ Payment Confirmed!',
          message: `Payment received and confirmed on blockchain${update.amount ? ` - ${update.amount} ${update.currency || 'USDC'}` : ''}`,
          timestamp: update.timestamp,
          reference: update.reference,
          signature: update.signature,
          amount: update.amount,
          currency: update.currency,
          read: false,
        };

        // Show success toast
        toast({
          title: '🎉 Payment Confirmed!',
          description: `Your payment has been received and confirmed on the blockchain.`,
          duration: 8000,
        });

        // Stop monitoring this reference
        stopMonitoring(update.reference);
        break;

      case 'failed':
        notification = {
          id: `failed_${update.reference}_${Date.now()}`,
          type: 'payment_failed',
          title: '❌ Payment Failed',
          message: `Payment transaction failed${update.signature ? ` (${update.signature.slice(0, 8)}...)` : ''}`,
          timestamp: update.timestamp,
          reference: update.reference,
          signature: update.signature,
          amount: update.amount,
          currency: update.currency,
          read: false,
        };

        // Show error toast
        toast({
          title: 'Payment Failed',
          description: 'The payment transaction was unsuccessful. Please try again.',
          variant: 'destructive',
          duration: 8000,
        });

        // Stop monitoring this reference
        stopMonitoring(update.reference);
        break;

      case 'expired':
        notification = {
          id: `expired_${update.reference}_${Date.now()}`,
          type: 'payment_expired',
          title: '⏰ Payment Expired',
          message: 'Payment request has expired. Create a new payment request.',
          timestamp: update.timestamp,
          reference: update.reference,
          amount: update.amount,
          currency: update.currency,
          read: false,
        };

        // Show warning toast
        toast({
          title: 'Payment Expired',
          description: 'The payment request has expired. Please create a new one.',
          variant: 'destructive',
          duration: 6000,
        });

        // Stop monitoring this reference
        stopMonitoring(update.reference);
        break;

      default:
        return; // Don't create notification for pending status
    }

    // Add notification to list
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep max 50 notifications

    // Trigger browser notification if permission granted
    if (Notification.permission === 'granted' && update.status === 'confirmed') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: `payment_${update.reference}`,
      });
    }
  }, [toast, stopMonitoring]);

  /**
   * Poll for transaction status updates
   */
  const pollForUpdates = useCallback(async () => {
    if (monitoringReferences.size === 0) return;

    console.log(`🔄 Polling ${monitoringReferences.size} payment references for updates`);

    const promises = Array.from(monitoringReferences).map(async (reference) => {
      try {
        const status = await AfriPayAPI.checkPaymentStatus(reference);
        
        if (status.confirmed || status.status === 'failed') {
          const update: TransactionStatusUpdate = {
            reference,
            status: status.confirmed ? 'confirmed' : 'failed',
            signature: status.signature,
            timestamp: new Date(),
            amount: status.paymentRequest?.amount,
            currency: status.paymentRequest?.currency,
          };
          
          processStatusUpdate(update);
        }
      } catch (error) {
        console.warn(`Failed to check status for reference ${reference}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }, [monitoringReferences, processStatusUpdate]);

  /**
   * Start the monitoring loop
   */
  useEffect(() => {
    if (monitoringReferences.size === 0) {
      setIsMonitoring(false);
      return;
    }

    setIsMonitoring(true);
    
    // Poll every 5 seconds
    const pollInterval = setInterval(pollForUpdates, 5000);
    
    // Initial poll
    pollForUpdates();

    return () => {
      clearInterval(pollInterval);
      setIsMonitoring(false);
    };
  }, [monitoringReferences, pollForUpdates]);

  /**
   * Request browser notification permission
   */
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  /**
   * Clear a specific notification
   */
  const clearNotification = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  }, []);

  /**
   * Clear all notifications
   */
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Get unread notification count
   */
  const unreadCount = notifications.filter(n => !n.read).length;

  /**
   * Get notifications by type
   */
  const getNotificationsByType = useCallback((type: TransactionNotification['type']) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  /**
   * Check if a reference is being monitored
   */
  const isMonitoringReference = useCallback((reference: string) => {
    return monitoringReferences.has(reference);
  }, [monitoringReferences]);

  // Initialize notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  return {
    // State
    notifications,
    unreadCount,
    isMonitoring,
    monitoringReferences: Array.from(monitoringReferences),

    // Actions
    monitorPayment,
    stopMonitoring,
    processStatusUpdate,
    requestNotificationPermission,

    // Notification management
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    
    // Utilities
    getNotificationsByType,
    isMonitoringReference,
  };
};
