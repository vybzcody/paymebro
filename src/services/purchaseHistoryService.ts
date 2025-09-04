import { supabaseService } from './supabaseService';

export interface PurchaseRecord {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  description?: string;
  signature?: string;
}

class PurchaseHistoryService {
  /**
   * Check if a wallet has already purchased a specific item/payment
   * Prevents double purchases (Compet pattern)
   */
  async hasPurchased(walletAddress: string, reference: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseService
        .from('payments')
        .select('id, status')
        .eq('customer_wallet', walletAddress)
        .eq('reference', reference)
        .eq('status', 'confirmed')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking purchase history:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Purchase history check failed:', error);
      return false;
    }
  }

  /**
   * Get purchase history for a wallet
   */
  async getPurchaseHistory(walletAddress: string): Promise<PurchaseRecord[]> {
    try {
      const { data, error } = await supabaseService
        .from('payments')
        .select('*')
        .eq('customer_wallet', walletAddress)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching purchase history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Purchase history fetch failed:', error);
      return [];
    }
  }

  /**
   * Add completed purchase to history
   */
  async addPurchase(purchase: {
    reference: string;
    walletAddress: string;
    signature: string;
  }): Promise<void> {
    try {
      const { error } = await supabaseService
        .from('payments')
        .update({
          status: 'confirmed',
          signature: purchase.signature,
          confirmed_at: new Date().toISOString()
        })
        .eq('reference', purchase.reference);

      if (error) {
        console.error('Error updating purchase status:', error);
      }
    } catch (error) {
      console.error('Purchase update failed:', error);
    }
  }
}

export const purchaseHistoryService = new PurchaseHistoryService();
