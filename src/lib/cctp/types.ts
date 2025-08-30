export enum CctpNetworkId {
  SOLANA = 'solana',
  ETHEREUM = 1,
  ARBITRUM = 42161,
  BASE = 8453,
  POLYGON = 137,
  AVALANCHE = 43114,
}

export enum CctpDomain {
  ETHEREUM = 0,
  AVALANCHE = 1,
  ARBITRUM = 3,
  SOLANA = 5,
  BASE = 6,
  POLYGON = 7,
}

export interface CctpNetworkAdapter {
  id: CctpNetworkId;
  name: string;
  domain: CctpDomain;
  type: 'evm' | 'solana';
  logoUrl: string;
  nativeCurrency: {
    symbol: string;
    decimals: number;
    name: string;
  };
  usdcAddress: string;
  tokenMessengerAddress?: string;
  messageTransmitterAddress?: string;
  rpcUrl: string;
  explorerUrl: string;
}

export interface CrossChainTransfer {
  id: string;
  sourceChain: CctpNetworkId;
  destinationChain: CctpNetworkId;
  amount: number;
  sourceTxHash?: string;
  destinationTxHash?: string;
  burnMessage?: string;
  attestation?: string;
  status: 'initiated' | 'burned' | 'attesting' | 'ready_to_mint' | 'minting' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}
