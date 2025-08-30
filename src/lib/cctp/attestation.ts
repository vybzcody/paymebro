import axios from 'axios';
import { CctpDomain } from './types';

const ATTESTATION_API_URL = 'https://iris-api.circle.com/v2';

export interface AttestationMessage {
  attestation?: string;
  message?: string;
  status: 'complete' | 'pending_confirmations' | 'error';
  error?: string;
}

export const getAttestation = async (
  sourceDomain: CctpDomain,
  burnTxHash: string
): Promise<AttestationMessage> => {
  try {
    const response = await axios.get(
      `${ATTESTATION_API_URL}/messages/${sourceDomain}?transactionHash=${burnTxHash}`
    );
    
    const message = response.data?.messages?.[0];
    if (!message) {
      return { status: 'error', error: 'No message found' };
    }

    return {
      attestation: message.attestation,
      message: message.message,
      status: message.status,
    };
  } catch (error) {
    console.error('Failed to get attestation:', error);
    return { 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const pollForAttestation = async (
  sourceDomain: CctpDomain,
  burnTxHash: string,
  maxAttempts: number = 60,
  intervalMs: number = 5000
): Promise<AttestationMessage> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await getAttestation(sourceDomain, burnTxHash);
    
    if (result.status === 'complete' || result.status === 'error') {
      return result;
    }
    
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  
  return { status: 'error', error: 'Attestation timeout' };
};
