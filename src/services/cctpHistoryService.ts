import { supabase } from '@/lib/supabase';

interface CCTPTransaction {
  id: string;
  sourceChain: string;
  destinationChain: string;
  amount: number;
  status: 'pending' | 'burned' | 'attesting' | 'completed' | 'failed';
  burnTxHash?: string;
  mintTxHash?: string;
  createdAt: string;
  completedAt?: string;
  merchantId: string;
}

export const getCCTPTransactions = async (merchantId: string): Promise<CCTPTransaction[]> => {
  try {
    const { data, error } = await supabase
      .from('cross_chain_transactions')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch CCTP transactions:', error);
    return [];
  }
};

export const createCCTPTransaction = async (params: {
  sourceChainId: string;
  destinationChainId: string;
  amount: number;
  estimatedTime: number;
}): Promise<string> => {
  try {
    const response = await fetch('https://paymebro-backend-production.up.railway.app/api/cctp/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error('Failed to create CCTP transaction');
    }

    const { id } = await response.json();
    return id;
  } catch (error) {
    console.error('Failed to create CCTP transaction:', error);
    throw error;
  }
};

export const updateCCTPTransaction = async (
  id: string, 
  updates: {
    status?: 'pending' | 'burned' | 'attesting' | 'completed' | 'failed';
    burnTxHash?: string;
    mintTxHash?: string;
    completedAt?: string;
    actualTime?: number;
  }
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('cross_chain_transactions')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update CCTP transaction:', error);
    throw error;
  }
};
