import { useState } from 'react';
import { CctpNetworkId, DESTINATION_DOMAINS, networkAdapters, findNetworkAdapter } from '@/lib/cctp/types';
import { useMultiChainWeb3Auth } from '@/contexts/MultiChainWeb3AuthContext';

export type TransferStep =
  | "idle"
  | "approving"
  | "burning" 
  | "waiting-attestation"
  | "minting"
  | "completed"
  | "error";

interface TransferParams {
  sourceChainId: CctpNetworkId;
  destinationChainId: CctpNetworkId;
  amount: string;
  mintRecipient: string;
}

interface CCTPTransferState {
  currentStep: TransferStep;
  transferAmount: string;
  logs: string[];
  error: string | null;
  burnTxHash?: string;
  mintTxHash?: string;
}

// Circle's production CCTP API
const CIRCLE_API_URL = 'https://iris-api.circle.com/v2';

interface AttestationResponse {
  status: 'complete' | 'pending_confirmations' | 'error';
  attestation?: string;
  message?: string;
  error?: string;
  decodedMessage?: {
    decodedMessageBody: {
      amount: string;
      mintRecipient: string;
    };
  };
}

export const useCCTPTransfer = () => {
  const { wallets, keyService } = useMultiChainWeb3Auth();
  const [state, setState] = useState<CCTPTransferState>({
    currentStep: 'idle',
    transferAmount: '',
    logs: [],
    error: null
  });

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setState(prev => ({
      ...prev,
      logs: [...prev.logs, `[${timestamp}] ${message}`]
    }));
  };

  const executeTransfer = async (params: TransferParams) => {
    if (!keyService) {
      throw new Error('Multi-chain key service not available');
    }

    try {
      setState(prev => ({ ...prev, currentStep: 'burning', error: null }));
      
      const sourceNetwork = findNetworkAdapter(params.sourceChainId);
      const destNetwork = findNetworkAdapter(params.destinationChainId);
      
      if (!sourceNetwork || !destNetwork) {
        throw new Error('Unsupported network configuration');
      }

      addLog(`Initiating CCTP burn of ${params.amount} USDC on ${sourceNetwork.name}...`);

      // Step 1: Execute burn transaction
      const burnTxHash = await executeBurnTransaction(params);
      setState(prev => ({ ...prev, burnTxHash }));
      addLog(`Burn transaction submitted: ${burnTxHash}`);

      // Step 2: Wait for attestation from Circle
      setState(prev => ({ ...prev, currentStep: 'waiting-attestation' }));
      addLog('Waiting for Circle attestation (typically 10-20 minutes)...');
      
      const attestation = await waitForAttestation(burnTxHash, params.sourceChainId);
      addLog('✅ Attestation received from Circle');

      // Step 3: Execute mint transaction on destination
      setState(prev => ({ ...prev, currentStep: 'minting' }));
      addLog(`Minting ${params.amount} USDC on ${destNetwork.name}...`);
      
      const mintTxHash = await executeMintTransaction(
        attestation.message!,
        attestation.attestation!,
        params
      );
      
      setState(prev => ({ 
        ...prev, 
        currentStep: 'completed',
        mintTxHash,
        transferAmount: params.amount
      }));
      addLog(`🎉 Transfer completed! Mint transaction: ${mintTxHash}`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        currentStep: 'error',
        error: errorMessage
      }));
      addLog(`❌ Error: ${errorMessage}`);
    }
  };

  const executeBurnTransaction = async (params: TransferParams): Promise<string> => {
    const sourceNetwork = findNetworkAdapter(params.sourceChainId);
    const destNetwork = findNetworkAdapter(params.destinationChainId);
    
    if (!sourceNetwork || !destNetwork) {
      throw new Error('Network configuration error');
    }

    if (!keyService) {
      throw new Error('Key service not available');
    }

    // Get the account for the source chain
    const { address, signer } = await keyService.getAccountForChain(params.sourceChainId);
    
    if (params.sourceChainId === CctpNetworkId.SOLANA) {
      return executeSolanaBurn(params, address, signer);
    } else {
      return executeEVMBurn(params, address, signer);
    }
  };

  const executeSolanaBurn = async (params: TransferParams, address: string, signer: any): Promise<string> => {
    // This requires the actual Solana CCTP program integration
    // For now, we'll use the backend API to handle the burn
    try {
      const response = await fetch('https://paymebro-backend-production.up.railway.app/api/cctp/burn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceChain: params.sourceChainId,
          destinationChain: params.destinationChainId,
          amount: params.amount,
          mintRecipient: params.mintRecipient,
          senderAddress: address
        })
      });

      if (!response.ok) {
        throw new Error(`Burn transaction failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.txHash;
    } catch (error) {
      throw new Error(`Solana burn failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const executeEVMBurn = async (params: TransferParams, address: string, signer: any): Promise<string> => {
    // This requires EVM CCTP contract integration
    try {
      const response = await fetch('https://paymebro-backend-production.up.railway.app/api/cctp/burn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceChain: params.sourceChainId,
          destinationChain: params.destinationChainId,
          amount: params.amount,
          mintRecipient: params.mintRecipient,
          senderAddress: address
        })
      });

      if (!response.ok) {
        throw new Error(`Burn transaction failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.txHash;
    } catch (error) {
      throw new Error(`EVM burn failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const waitForAttestation = async (
    txHash: string, 
    sourceChain: CctpNetworkId
  ): Promise<AttestationResponse> => {
    const sourceDomain = DESTINATION_DOMAINS[sourceChain];
    const maxAttempts = 120; // 20 minutes with 10s intervals
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const url = `${CIRCLE_API_URL}/messages/${sourceDomain}?transactionHash=${txHash}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          const message = data.messages?.[0];
          
          if (message && message.status === 'complete') {
            return {
              status: 'complete',
              message: message.message,
              attestation: message.attestation,
              decodedMessage: message.decodedMessage
            };
          } else if (message && message.status === 'pending_confirmations') {
            addLog(`⏳ Attestation pending confirmations... (${attempts + 1}/${maxAttempts})`);
          }
        }

        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
        attempts++;
      } catch (error) {
        addLog(`⚠️ Attestation check failed: ${error}`);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    throw new Error('Attestation timeout - Circle did not provide attestation within 20 minutes');
  };

  const executeMintTransaction = async (
    message: string,
    attestation: string,
    params: TransferParams
  ): Promise<string> => {
    try {
      const response = await fetch('https://paymebro-backend-production.up.railway.app/api/cctp/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          attestation,
          destinationChain: params.destinationChainId,
          mintRecipient: params.mintRecipient
        })
      });

      if (!response.ok) {
        throw new Error(`Mint transaction failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.txHash;
    } catch (error) {
      throw new Error(`Mint failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const reset = () => {
    setState({
      currentStep: 'idle',
      transferAmount: '',
      logs: [],
      error: null
    });
  };

  return {
    ...state,
    executeTransfer,
    reset,
    addLog
  };
};
