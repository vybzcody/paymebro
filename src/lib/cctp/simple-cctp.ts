import { CctpNetworkId, DESTINATION_DOMAINS } from './types';

export interface CCTPTransfer {
  id: string;
  sourceChain: CctpNetworkId;
  destinationChain: CctpNetworkId;
  amount: number;
  status: 'pending' | 'burned' | 'attesting' | 'completed' | 'failed';
  burnTxHash?: string;
  mintTxHash?: string;
  createdAt: string;
}

export const CHAINS = {
  [CctpNetworkId.SOLANA]: { name: 'Solana Devnet', domain: 5 },
  [CctpNetworkId.ETHEREUM]: { name: 'Ethereum Sepolia', domain: 0 },
  [CctpNetworkId.ARBITRUM]: { name: 'Arbitrum Sepolia', domain: 3 },
  [CctpNetworkId.BASE]: { name: 'Base Sepolia', domain: 6 },
  [CctpNetworkId.POLYGON]: { name: 'Polygon Mumbai', domain: 7 },
  [CctpNetworkId.AVALANCHE]: { name: 'Avalanche Fuji', domain: 1 }
};

const CIRCLE_API_URL = 'https://iris-api.circle.com/v2';

export class SimpleCCTPService {
  async createTransfer(params: { 
    sourceChain: CctpNetworkId; 
    destinationChain: CctpNetworkId; 
    amount: number 
  }): Promise<CCTPTransfer> {
    return {
      id: crypto.randomUUID(),
      sourceChain: params.sourceChain,
      destinationChain: params.destinationChain,
      amount: params.amount,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
  }

  async executeBurn(transfer: CCTPTransfer, wallet: { sourceAddress?: string; destinationAddress?: string }): Promise<string> {
    try {
      // Call backend API to execute the burn transaction
      const response = await fetch('https://paymebro-backend-production.up.railway.app/api/cctp/burn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceChain: transfer.sourceChain.toString(),
          destinationChain: transfer.destinationChain.toString(),
          amount: transfer.amount.toString(),
          mintRecipient: wallet.destinationAddress || 'placeholder-recipient-address',
          senderAddress: wallet.sourceAddress || 'placeholder-sender-address',
          transferId: transfer.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Burn API error:', errorData);
        throw new Error(`Burn failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.txHash;
    } catch (error) {
      console.error('Burn execution error:', error);
      throw new Error(`Burn execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async monitorTransfer(
    transfer: CCTPTransfer, 
    burnTxHash: string, 
    onStatusUpdate: (status: CCTPTransfer['status']) => void
  ): Promise<void> {
    try {
      // Update status to burned
      onStatusUpdate('burned');

      // Wait for Circle attestation
      onStatusUpdate('attesting');
      const attestation = await this.waitForAttestation(burnTxHash, transfer.sourceChain);

      if (attestation) {
        // Execute mint transaction
        const mintTxHash = await this.executeMint(
          attestation.message,
          attestation.attestation,
          transfer
        );

        if (mintTxHash) {
          onStatusUpdate('completed');
        } else {
          onStatusUpdate('failed');
        }
      } else {
        onStatusUpdate('failed');
      }
    } catch (error) {
      console.error('Transfer monitoring failed:', error);
      onStatusUpdate('failed');
    }
  }

  private async waitForAttestation(
    txHash: string, 
    sourceChain: CctpNetworkId
  ): Promise<{ message: string; attestation: string } | null> {
    const sourceDomain = DESTINATION_DOMAINS[sourceChain];
    const maxAttempts = 120; // 20 minutes
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const url = `${CIRCLE_API_URL}/attestations/${sourceDomain}/${txHash}`;
        console.log(`Checking attestation: ${url}`);
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          const message = data.messages?.[0];
          
          if (message && message.status === 'complete') {
            return {
              message: message.message,
              attestation: message.attestation
            };
          }
        }

        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
        attempts++;
      } catch (error) {
        console.error('Attestation check failed:', error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    return null; // Timeout
  }

  private async executeMint(
    message: string,
    attestation: string,
    transfer: CCTPTransfer
  ): Promise<string | null> {
    try {
      const response = await fetch('https://paymebro-backend-production.up.railway.app/api/cctp/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          attestation,
          destinationChain: transfer.destinationChain,
          transferId: transfer.id
        })
      });

      if (!response.ok) {
        throw new Error(`Mint failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.txHash;
    } catch (error) {
      console.error('Mint execution failed:', error);
      return null;
    }
  }
}

export const simpleCCTPService = new SimpleCCTPService();
