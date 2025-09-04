export enum CctpNetworkId {
  SOLANA = 'solana-devnet',
  ETHEREUM = 'ethereum-sepolia',
  ARBITRUM = 'arbitrum-sepolia',
  BASE = 'base-sepolia',
  POLYGON = 'polygon-mumbai',
  AVALANCHE = 'avalanche-fuji'
}

export type CctpNetworkAdapterId = CctpNetworkId;
export type SupportedChainId = CctpNetworkId;

export enum CctpV2TransferType {
  Standard = "standard",
  Fast = "fast",
}

export interface NetworkAdapter {
  id: CctpNetworkId;
  name: string;
  chainId: number | string;
}

export const networkAdapters: NetworkAdapter[] = [
  { id: CctpNetworkId.SOLANA, name: 'Solana Devnet', chainId: 'solana-devnet' },
  { id: CctpNetworkId.ETHEREUM, name: 'Ethereum Sepolia', chainId: 11155111 },
  { id: CctpNetworkId.ARBITRUM, name: 'Arbitrum Sepolia', chainId: 421614 },
  { id: CctpNetworkId.BASE, name: 'Base Sepolia', chainId: 84532 },
  { id: CctpNetworkId.POLYGON, name: 'Polygon Mumbai', chainId: 80001 },
  { id: CctpNetworkId.AVALANCHE, name: 'Avalanche Fuji', chainId: 43113 }
];

export const findNetworkAdapter = (id?: CctpNetworkId) => {
  return networkAdapters.find(adapter => adapter.id === id);
};

export const IS_TESTNET = true;
export const DESTINATION_DOMAINS = { 
  [CctpNetworkId.SOLANA]: 5, 
  [CctpNetworkId.ETHEREUM]: 0,
  [CctpNetworkId.ARBITRUM]: 3,
  [CctpNetworkId.BASE]: 6,
  [CctpNetworkId.POLYGON]: 7,
  [CctpNetworkId.AVALANCHE]: 1
};
export const CHAIN_TO_CHAIN_NAME = { 
  [CctpNetworkId.SOLANA]: 'Solana', 
  [CctpNetworkId.ETHEREUM]: 'Ethereum',
  [CctpNetworkId.ARBITRUM]: 'Arbitrum',
  [CctpNetworkId.BASE]: 'Base',
  [CctpNetworkId.POLYGON]: 'Polygon',
  [CctpNetworkId.AVALANCHE]: 'Avalanche'
};
