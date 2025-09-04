import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';

// Get Associated Token Account address
export async function getATA2(mint: PublicKey, owner: PublicKey): Promise<PublicKey> {
  return await getAssociatedTokenAddress(mint, owner);
}

// Convert EVM address to Solana format (simplified)
export function evmAddressToSolana(evmAddress: string): PublicKey {
  // This is a simplified conversion - in production you'd use proper address derivation
  // For now, we'll create a deterministic PublicKey from the EVM address
  const buffer = Buffer.from(evmAddress.slice(2), 'hex');
  const paddedBuffer = Buffer.alloc(32);
  buffer.copy(paddedBuffer, 0);
  return new PublicKey(paddedBuffer);
}
