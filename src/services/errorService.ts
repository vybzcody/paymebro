/**
 * Error Service - Centralized error handling and reporting
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  WALLET = 'WALLET',
  PAYMENT = 'PAYMENT',
  CCTP = 'CCTP',
  DATABASE = 'DATABASE',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface ErrorContext {
  userId?: string;
  chainId?: string;
  transactionId?: string;
  paymentId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  context: ErrorContext;
  timestamp: string;
  userAgent: string;
  url: string;
}

/**
 * Error Service Class
 */
export class ErrorService {
  private static instance: ErrorService;
  private errorQueue: ErrorReport[] = [];
  private isOnline = navigator.onLine;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Global error handlers
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers() {
    // Unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportError({
        type: ErrorType.UNKNOWN,
        severity: ErrorSeverity.HIGH,
        message: event.message,
        stack: event.error?.stack,
        context: {
          component: 'Global',
          action: 'unhandled_error',
          metadata: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        },
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        type: ErrorType.UNKNOWN,
        severity: ErrorSeverity.HIGH,
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        context: {
          component: 'Global',
          action: 'unhandled_rejection',
          metadata: {
            reason: event.reason,
          },
        },
      });
    });
  }

  /**
   * Report an error
   */
  reportError(params: {
    type: ErrorType;
    severity: ErrorSeverity;
    message: string;
    stack?: string;
    context: ErrorContext;
  }): string {
    const errorReport: ErrorReport = {
      id: crypto.randomUUID(),
      type: params.type,
      severity: params.severity,
      message: params.message,
      stack: params.stack,
      context: params.context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Log to console
    this.logToConsole(errorReport);

    // Add to queue for external reporting
    this.errorQueue.push(errorReport);

    // Try to send immediately if online
    if (this.isOnline) {
      this.flushErrorQueue();
    }

    return errorReport.id;
  }

  /**
   * Report wallet-related errors
   */
  reportWalletError(message: string, context: ErrorContext, severity = ErrorSeverity.MEDIUM): string {
    return this.reportError({
      type: ErrorType.WALLET,
      severity,
      message,
      context: {
        ...context,
        component: context.component || 'Wallet',
      },
    });
  }

  /**
   * Report payment-related errors
   */
  reportPaymentError(message: string, context: ErrorContext, severity = ErrorSeverity.HIGH): string {
    return this.reportError({
      type: ErrorType.PAYMENT,
      severity,
      message,
      context: {
        ...context,
        component: context.component || 'Payment',
      },
    });
  }

  /**
   * Report CCTP-related errors
   */
  reportCCTPError(message: string, context: ErrorContext, severity = ErrorSeverity.HIGH): string {
    return this.reportError({
      type: ErrorType.CCTP,
      severity,
      message,
      context: {
        ...context,
        component: context.component || 'CCTP',
      },
    });
  }

  /**
   * Report network-related errors
   */
  reportNetworkError(message: string, context: ErrorContext, severity = ErrorSeverity.MEDIUM): string {
    return this.reportError({
      type: ErrorType.NETWORK,
      severity,
      message,
      context: {
        ...context,
        component: context.component || 'Network',
      },
    });
  }

  /**
   * Report database-related errors
   */
  reportDatabaseError(message: string, context: ErrorContext, severity = ErrorSeverity.HIGH): string {
    return this.reportError({
      type: ErrorType.DATABASE,
      severity,
      message,
      context: {
        ...context,
        component: context.component || 'Database',
      },
    });
  }

  /**
   * Log error to console with formatting
   */
  private logToConsole(error: ErrorReport) {
    const style = this.getConsoleStyle(error.severity);
    
    console.group(`%c[${error.type}] ${error.message}`, style);
    console.log('Error ID:', error.id);
    console.log('Severity:', error.severity);
    console.log('Timestamp:', error.timestamp);
    console.log('Context:', error.context);
    
    if (error.stack) {
      console.log('Stack:', error.stack);
    }
    
    console.groupEnd();
  }

  /**
   * Get console styling based on severity
   */
  private getConsoleStyle(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'color: white; background-color: #dc2626; font-weight: bold; padding: 2px 4px;';
      case ErrorSeverity.HIGH:
        return 'color: white; background-color: #ea580c; font-weight: bold; padding: 2px 4px;';
      case ErrorSeverity.MEDIUM:
        return 'color: white; background-color: #d97706; padding: 2px 4px;';
      case ErrorSeverity.LOW:
        return 'color: white; background-color: #65a30d; padding: 2px 4px;';
      default:
        return 'color: white; background-color: #6b7280; padding: 2px 4px;';
    }
  }

  /**
   * Flush error queue to external service
   */
  private async flushErrorQueue() {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // In production, send to error tracking service
      await this.sendToExternalService(errors);
    } catch (error) {
      console.error('Failed to send errors to external service:', error);
      // Re-add errors to queue for retry
      this.errorQueue.unshift(...errors);
    }
  }

  /**
   * Send errors to external monitoring service
   */
  private async sendToExternalService(errors: ErrorReport[]): Promise<void> {
    // For now, just log to console
    // In production, replace with actual service call (Sentry, LogRocket, etc.)
    console.log('Sending errors to external service:', errors);

    // Example implementation:
    // await fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ errors }),
    // });
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error: Error | string, type?: ErrorType): string {
    const message = typeof error === 'string' ? error : error.message;

    // Common error patterns and their user-friendly messages
    const errorPatterns = {
      [ErrorType.WALLET]: {
        'User rejected': 'Transaction was cancelled by user',
        'insufficient funds': 'Insufficient balance to complete transaction',
        'network error': 'Unable to connect to wallet. Please check your connection.',
      },
      [ErrorType.PAYMENT]: {
        'timeout': 'Payment timed out. Please try again.',
        'invalid amount': 'Invalid payment amount specified',
        'recipient not found': 'Payment recipient address is invalid',
      },
      [ErrorType.CCTP]: {
        'attestation failed': 'Cross-chain transfer verification failed. Please try again.',
        'burn failed': 'Failed to initiate cross-chain transfer',
        'mint failed': 'Failed to complete cross-chain transfer',
      },
      [ErrorType.NETWORK]: {
        'fetch failed': 'Network connection failed. Please check your internet connection.',
        'timeout': 'Request timed out. Please try again.',
      },
    };

    if (type && errorPatterns[type]) {
      const patterns = errorPatterns[type];
      for (const [pattern, friendlyMessage] of Object.entries(patterns)) {
        if (message.toLowerCase().includes(pattern.toLowerCase())) {
          return friendlyMessage;
        }
      }
    }

    // Default fallback messages
    if (message.toLowerCase().includes('network')) {
      return 'Network connection issue. Please check your internet connection and try again.';
    }
    
    if (message.toLowerCase().includes('timeout')) {
      return 'Request timed out. Please try again.';
    }

    return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
  }

  /**
   * Clear error queue (for testing)
   */
  clearErrorQueue(): void {
    this.errorQueue = [];
  }
}

// Export singleton instance
export const errorService = ErrorService.getInstance();

// Export utility functions
export const reportError = (params: {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  context: ErrorContext;
}) => errorService.reportError(params);

export const reportWalletError = (message: string, context: ErrorContext, severity?: ErrorSeverity) =>
  errorService.reportWalletError(message, context, severity);

export const reportPaymentError = (message: string, context: ErrorContext, severity?: ErrorSeverity) =>
  errorService.reportPaymentError(message, context, severity);

export const reportCCTPError = (message: string, context: ErrorContext, severity?: ErrorSeverity) =>
  errorService.reportCCTPError(message, context, severity);

export const reportDatabaseError = (message: string, context: ErrorContext, severity?: ErrorSeverity) =>
  errorService.reportDatabaseError(message, context, severity);

export const reportNetworkError = (message: string, context: ErrorContext, severity?: ErrorSeverity) =>
  errorService.reportNetworkError(message, context, severity);

export const getUserFriendlyMessage = (error: Error | string, type?: ErrorType) =>
  errorService.getUserFriendlyMessage(error, type);
