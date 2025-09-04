/**
 * CCTP Payment Processor - Cross-chain USDC payment processing
 * Integrates CCTP v2 with payment flows for seamless multi-chain payments
 */

import { simpleCCTPService, CCTPTransfer } from '@/lib/cctp/simple-cctp';
import { CctpNetworkId } from '@/lib/cctp/types';
import { supabase } from '@/lib/supabase';
import { paymentProcessor, PaymentInitiationParams } from './paymentProcessor';

export interface CrossChainPaymentParams extends PaymentInitiationParams {
  sourceChain: CctpNetworkId;
  destinationChain: CctpNetworkId;
  sourceWalletAddress: string;
  destinationWalletAddress: string;
}

export interface CrossChainPaymentRecord {
  paymentId: string;
  transferId: string;
  sourceChain: CctpNetworkId;
  destinationChain: CctpNetworkId;
  burnTxHash?: string;
  mintTxHash?: string;
  status: 'pending' | 'burned' | 'attesting' | 'completed' | 'failed';
  estimatedTime: number;
  actualTime?: number;
}

/**
 * CCTP Payment Processor Class
 */
export class CCTPPaymentProcessor {
  /**
   * Initiate cross-chain USDC payment
   */
  async initiateCrossChainPayment(params: CrossChainPaymentParams): Promise<{
    paymentId: string;
    transferId: string;
    paymentUrl: string;
    qrCodeUrl: string;
    estimatedTime: number;
  }> {
    try {
      // Create CCTP transfer
      const transfer = await simpleCCTPService.createTransfer({
        sourceChain: params.sourceChain,
        destinationChain: params.destinationChain,
        amount: params.amount,
      });

      // Create payment record (using destination chain wallet)
      const paymentResult = await paymentProcessor.initiatePayment({
        ...params,
        merchantWallet: params.destinationWalletAddress,
      });

      // Store cross-chain transaction record
      const crossChainRecord = {
        payment_id: paymentResult.paymentId,
        merchant_id: params.userId,
        source_chain_id: params.sourceChain,
        destination_chain_id: params.destinationChain,
        amount_burned: params.amount,
        estimated_time: this.getEstimatedTime(params.sourceChain, params.destinationChain),
        status: 'pending' as const,
      };

      const { data, error } = await supabase
        .from('cross_chain_transactions')
        .insert(crossChainRecord)
        .select()
        .single();

      if (error) throw error;

      return {
        paymentId: paymentResult.paymentId,
        transferId: transfer.id,
        paymentUrl: paymentResult.paymentUrl,
        qrCodeUrl: paymentResult.qrCodeUrl,
        estimatedTime: crossChainRecord.estimated_time,
      };
    } catch (error) {
      console.error('Cross-chain payment initiation failed:', error);
      throw new Error(`Failed to initiate cross-chain payment: ${error}`);
    }
  }

  /**
   * Execute cross-chain transfer with wallet
   */
  async executeCrossChainTransfer(
    paymentId: string,
    walletContext: {
      sourceAddress: string;
      destinationAddress: string;
    }
  ): Promise<{
    burnTxHash: string;
    transfer: CCTPTransfer;
  }> {
    try {
      // Get cross-chain transaction record
      const { data: crossChainTx, error } = await supabase
        .from('cross_chain_transactions')
        .select('*')
        .eq('payment_id', paymentId)
        .single();

      if (error || !crossChainTx) throw new Error('Cross-chain transaction not found');

      // Create transfer object
      const transfer: CCTPTransfer = {
        id: crypto.randomUUID(),
        sourceChain: crossChainTx.source_chain_id as CctpNetworkId,
        destinationChain: crossChainTx.destination_chain_id as CctpNetworkId,
        amount: crossChainTx.amount_burned,
        status: 'pending',
        createdAt: crossChainTx.created_at,
      };

      // Execute burn transaction
      const burnTxHash = await simpleCCTPService.executeBurn(transfer, {
        sourceAddress: walletContext.sourceAddress,
        destinationAddress: walletContext.destinationAddress,
      });

      // Update cross-chain transaction record
      await supabase
        .from('cross_chain_transactions')
        .update({
          source_tx_hash: burnTxHash,
          status: 'burned',
        })
        .eq('id', crossChainTx.id);

      // Start monitoring transfer
      this.monitorCrossChainTransfer(crossChainTx.id, transfer, burnTxHash);

      return { burnTxHash, transfer };
    } catch (error) {
      console.error('Cross-chain transfer execution failed:', error);
      throw new Error(`Failed to execute cross-chain transfer: ${error}`);
    }
  }

  /**
   * Monitor cross-chain transfer progress
   */
  private async monitorCrossChainTransfer(
    crossChainTxId: string,
    transfer: CCTPTransfer,
    burnTxHash: string
  ): Promise<void> {
    const startTime = Date.now();

    try {
      await simpleCCTPService.monitorTransfer(
        transfer,
        burnTxHash,
        async (status) => {
          // Update cross-chain transaction status
          const updateData: any = { status };

          if (status === 'completed') {
            updateData.completed_at = new Date().toISOString();
            updateData.actual_time = Math.floor((Date.now() - startTime) / 1000);
          }

          await supabase
            .from('cross_chain_transactions')
            .update(updateData)
            .eq('id', crossChainTxId);

          // If completed, also update the payment status
          if (status === 'completed') {
            const { data: crossChainTx } = await supabase
              .from('cross_chain_transactions')
              .select('payment_id')
              .eq('id', crossChainTxId)
              .single();

            if (crossChainTx?.payment_id) {
              await supabase
                .from('payments')
                .update({ status: 'confirmed' })
                .eq('id', crossChainTx.payment_id);
            }
          }
        }
      );
    } catch (error) {
      console.error('Cross-chain transfer monitoring failed:', error);
      
      // Update status to failed
      await supabase
        .from('cross_chain_transactions')
        .update({ status: 'failed' })
        .eq('id', crossChainTxId);
    }
  }

  /**
   * Get cross-chain transfer status
   */
  async getCrossChainStatus(paymentId: string): Promise<CrossChainPaymentRecord | null> {
    try {
      const { data, error } = await supabase
        .from('cross_chain_transactions')
        .select('*')
        .eq('payment_id', paymentId)
        .single();

      if (error) {
        console.error('Error fetching cross-chain status:', error);
        return null;
      }

      return {
        paymentId: data.payment_id,
        transferId: data.id,
        sourceChain: data.source_chain_id,
        destinationChain: data.destination_chain_id,
        burnTxHash: data.source_tx_hash,
        mintTxHash: data.destination_tx_hash,
        status: data.status,
        estimatedTime: data.estimated_time,
        actualTime: data.actual_time,
      };
    } catch (error) {
      console.error('Failed to get cross-chain status:', error);
      return null;
    }
  }

  /**
   * Get estimated transfer time between chains
   */
  private getEstimatedTime(sourceChain: CctpNetworkId, destinationChain: CctpNetworkId): number {
    // Base times in seconds
    const baseTimes = {
      [CctpNetworkId.SOLANA]: 15,      // 15 seconds for Solana confirmation
      [CctpNetworkId.ETHEREUM]: 180,   // 3 minutes for Ethereum
      [CctpNetworkId.ARBITRUM]: 60,    // 1 minute for Arbitrum
      [CctpNetworkId.BASE]: 60,        // 1 minute for Base
      [CctpNetworkId.POLYGON]: 120,    // 2 minutes for Polygon
      [CctpNetworkId.AVALANCHE]: 90,   // 1.5 minutes for Avalanche
    };

    const sourceTime = baseTimes[sourceChain] || 120;
    const destinationTime = baseTimes[destinationChain] || 120;
    const attestationTime = 600; // 10 minutes for Circle attestation

    return sourceTime + attestationTime + destinationTime;
  }

  /**
   * Get supported chain pairs for CCTP
   */
  getSupportedChainPairs(): Array<{
    source: CctpNetworkId;
    destination: CctpNetworkId;
    estimatedTime: number;
  }> {
    const chains = Object.values(CctpNetworkId);
    const pairs: Array<{
      source: CctpNetworkId;
      destination: CctpNetworkId;
      estimatedTime: number;
    }> = [];

    chains.forEach(source => {
      chains.forEach(destination => {
        if (source !== destination) {
          pairs.push({
            source,
            destination,
            estimatedTime: this.getEstimatedTime(source, destination),
          });
        }
      });
    });

    return pairs;
  }
}

// Export singleton instance
export const cctpPaymentProcessor = new CCTPPaymentProcessor();
