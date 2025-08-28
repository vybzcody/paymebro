import { Connection, PublicKey } from '@solana/web3.js';
import { supabase } from '../config/supabase.js';

const connection = new Connection(process.env.RPC_ENDPOINT || 'https://api.devnet.solana.com');

class TransactionMonitor {
  constructor() {
    this.monitoredReferences = new Set();
    this.isRunning = false;
  }

  async startMonitoring() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    console.log('🔍 Starting transaction monitoring...');
    
    // Load existing references from database
    await this.loadReferences();
    
    // Start monitoring loop
    this.monitorLoop();
  }

  async loadReferences() {
    try {
      // Load QR code references
      const { data: qrCodes } = await supabase
        .from('qr_codes')
        .select('reference, id, user_id, amount, currency')
        .eq('is_active', true);

      // Load payment link references  
      const { data: paymentLinks } = await supabase
        .from('payment_links')
        .select('reference, id, user_id, amount, currency')
        .eq('is_active', true);

      const allReferences = [...(qrCodes || []), ...(paymentLinks || [])];
      
      for (const ref of allReferences) {
        this.monitoredReferences.add(ref.reference);
      }
      
      console.log(`📡 Monitoring ${this.monitoredReferences.size} payment references`);
    } catch (error) {
      console.error('Error loading references:', error);
    }
  }

  async monitorLoop() {
    while (this.isRunning) {
      try {
        await this.checkForNewTransactions();
        await new Promise(resolve => setTimeout(resolve, 10000)); // Check every 10 seconds
      } catch (error) {
        console.error('Error in monitor loop:', error);
        await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30s on error
      }
    }
  }

  async checkForNewTransactions() {
    for (const reference of this.monitoredReferences) {
      try {
        const signatures = await connection.getSignaturesForAddress(
          new PublicKey(reference),
          { limit: 5 }
        );

        for (const sig of signatures) {
          await this.processTransaction(sig.signature, reference);
        }
      } catch (error) {
        console.error(`Error checking reference ${reference}:`, error);
      }
    }
  }

  async processTransaction(signature, reference) {
    try {
      // Check if we already processed this transaction
      const { data: existing, error: checkError } = await supabase
        .from('transactions')
        .select('id')
        .eq('signature', signature)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`Error checking transaction ${signature}:`, checkError);
        return;
      }

      if (existing) {
        // console.log(`Transaction ${signature} already processed, skipping`);
        return; // Already processed
      }

      // Get transaction details
      const tx = await connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      });

      if (!tx || !tx.meta || tx.meta.err) return;

      // Find the payment link or QR code
      const { data: qrCode } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('reference', reference)
        .single();

      const { data: paymentLink } = await supabase
        .from('payment_links')
        .select('*')
        .eq('reference', reference)
        .single();

      const paymentData = qrCode || paymentLink;
      if (!paymentData) return;

      // Extract amount from transaction
      const amount = this.extractAmount(tx, paymentData.currency);
      if (!amount) return;

      // Record transaction with all required fields
      const feeRate = 0.029; // 2.9% fee
      const feeAmount = amount * feeRate;
      const merchantAmount = amount - feeAmount;

      const { data: newTransaction, error: insertError } = await supabase
        .from('transactions')
        .insert({
          user_id: paymentData.user_id,
          signature,
          reference,
          amount,
          currency: paymentData.currency,
          net_amount: merchantAmount,
          recipient_wallet: paymentData.user_id, // Using user_id as recipient
          total_amount_paid: amount,
          merchant_amount: merchantAmount,
          fee_amount: feeAmount,
          status: 'confirmed'
        })
        .select()
        .single();

      if (insertError) {
        console.error(`Error inserting transaction ${signature}:`, insertError);
        return;
      }

      console.log(`💾 Transaction saved to database:`, newTransaction.id);

      console.log(`✅ Processed payment: ${amount} ${paymentData.currency} - ${signature}`);
    } catch (error) {
      console.error(`Error processing transaction ${signature}:`, error);
    }
  }

  extractAmount(transaction, currency) {
    try {
      if (currency === 'SOL') {
        // For SOL, check balance changes
        const preBalances = transaction.meta.preBalances;
        const postBalances = transaction.meta.postBalances;
        
        for (let i = 0; i < preBalances.length; i++) {
          const diff = postBalances[i] - preBalances[i];
          if (diff > 0) {
            return diff / 1e9; // Convert lamports to SOL
          }
        }
      } else {
        // For SPL tokens, check token balance changes
        const preTokenBalances = transaction.meta.preTokenBalances || [];
        const postTokenBalances = transaction.meta.postTokenBalances || [];
        
        for (const postBalance of postTokenBalances) {
          const preBalance = preTokenBalances.find(
            pre => pre.accountIndex === postBalance.accountIndex
          );
          
          if (preBalance) {
            const diff = postBalance.uiTokenAmount.uiAmount - preBalance.uiTokenAmount.uiAmount;
            if (diff > 0) {
              return diff;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error extracting amount:', error);
    }
    return null;
  }

  addReference(reference) {
    this.monitoredReferences.add(reference);
  }

  removeReference(reference) {
    this.monitoredReferences.delete(reference);
  }

  stop() {
    this.isRunning = false;
    console.log('🛑 Transaction monitoring stopped');
  }
}

export const transactionMonitor = new TransactionMonitor();
