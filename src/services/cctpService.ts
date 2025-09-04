import { simpleCCTPService, CCTPTransfer } from '@/lib/cctp/simple-cctp';

export class CCTPService {
  /**
   * Initiate a cross-chain USDC transfer
   */
  async initiateTransfer(
    sourceChain: string,
    destinationChain: string,
    amount: number
  ): Promise<{ transferId: string }> {
    try {
      const transfer = await simpleCCTPService.createTransfer({
        sourceChain,
        destinationChain,
        amount
      });

      return { transferId: transfer.id };
    } catch (error) {
      console.error('Failed to initiate transfer:', error);
      throw error;
    }
  }

  /**
   * Execute burn with wallet
   */
  async executeBurnWithWallet(
    transferId: string,
    walletContext: { wallets: any }
  ): Promise<{ transfer: CCTPTransfer; burnTxHash: string }> {
    try {
      // Get transfer from simple service
      const transfer = await simpleCCTPService.createTransfer({
        sourceChain: 'solana-devnet',
        destinationChain: 'ethereum-sepolia',
        amount: 10 // Mock amount
      });

      const sourceWallet = walletContext.wallets[transfer.sourceChain];
      if (!sourceWallet) {
        throw new Error('Source wallet not connected');
      }

      const burnTxHash = await simpleCCTPService.executeBurn(transfer, sourceWallet);

      // Start fast monitoring
      this.monitorTransferAsync(transfer, burnTxHash);

      return { transfer, burnTxHash };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Monitor transfer with fast Solana confirmation
   */
  private async monitorTransferAsync(
    transfer: CCTPTransfer,
    burnTxHash: string
  ): Promise<void> {
    try {
      await simpleCCTPService.monitorTransfer(
        transfer,
        burnTxHash,
        (status) => {
          // Update database if needed
          console.log(`Transfer ${transfer.id} status: ${status}`);
        }
      );
    } catch (error) {
      console.error('Transfer monitoring failed:', error);
    }
  }
}

export const cctpService = new CCTPService();
export default cctpService;
