import { supabase } from '@/lib/supabase';

interface CCTPTransactionUpdate {
  id: string;
  status: 'pending' | 'burned' | 'attesting' | 'minting' | 'completed' | 'failed';
  burnTxHash?: string;
  mintTxHash?: string;
  completedAt?: string;
  actualTime?: number;
}

type CCTPUpdateCallback = (update: CCTPTransactionUpdate) => void;

class CCTPWebSocketService {
  private callbacks: Set<CCTPUpdateCallback> = new Set();
  private subscription: any = null;

  /**
   * Subscribe to real-time CCTP transaction updates
   */
  subscribe(merchantId: string, callback: CCTPUpdateCallback): () => void {
    this.callbacks.add(callback);

    // If this is the first subscription, start listening
    if (this.callbacks.size === 1) {
      this.startListening(merchantId);
    }

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
      
      // If no more callbacks, stop listening
      if (this.callbacks.size === 0) {
        this.stopListening();
      }
    };
  }

  /**
   * Start listening to Supabase real-time updates
   */
  private startListening(merchantId: string) {
    this.subscription = supabase
      .channel('cctp_transactions')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cross_chain_transactions',
          filter: `merchant_id=eq.${merchantId}`
        },
        (payload) => {
          const update: CCTPTransactionUpdate = {
            id: payload.new.id,
            status: payload.new.status,
            burnTxHash: payload.new.source_tx_hash,
            mintTxHash: payload.new.destination_tx_hash,
            completedAt: payload.new.completed_at,
            actualTime: payload.new.actual_time
          };

          // Notify all callbacks
          this.callbacks.forEach(callback => callback(update));
        }
      )
      .subscribe();
  }

  /**
   * Stop listening to real-time updates
   */
  private stopListening() {
    if (this.subscription) {
      supabase.removeChannel(this.subscription);
      this.subscription = null;
    }
  }

  /**
   * Manually trigger status update (for testing)
   */
  async triggerUpdate(transactionId: string, status: CCTPTransactionUpdate['status']) {
    try {
      const { error } = await supabase
        .from('cross_chain_transactions')
        .update({ status })
        .eq('id', transactionId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to trigger update:', error);
    }
  }
}

// Export singleton instance
export const cctpWebSocketService = new CCTPWebSocketService();
export default cctpWebSocketService;
