export * from './types';

export const getSupportedChains = () => {
  return [
    { id: 'solana-devnet', name: 'Solana Devnet' },
    { id: 'ethereum-sepolia', name: 'Ethereum Sepolia' },
    { id: 'arbitrum-sepolia', name: 'Arbitrum Sepolia' },
    { id: 'base-sepolia', name: 'Base Sepolia' },
    { id: 'polygon-mumbai', name: 'Polygon Mumbai' },
    { id: 'avalanche-fuji', name: 'Avalanche Fuji' }
  ];
};

export const CHAIN_TO_CHAIN_NAME: Record<string, string> = {
  'solana-devnet': 'Solana',
  'ethereum-sepolia': 'Ethereum',
  'arbitrum-sepolia': 'Arbitrum',
  'base-sepolia': 'Base',
  'polygon-mumbai': 'Polygon',
  'avalanche-fuji': 'Avalanche'
};

export const CHAIN_LOGOS: Record<string, string> = {
  'solana-devnet': '/chains/solana.svg',
  'ethereum-sepolia': '/chains/ethereum.svg',
  'arbitrum-sepolia': '/chains/arbitrum.svg',
  'base-sepolia': '/chains/base.svg',
  'polygon-mumbai': '/chains/polygon.svg',
  'avalanche-fuji': '/chains/avalanche.svg'
};

export const IS_TESTNET = true;
export const SupportedChainId = {
  SOLANA: 'solana-devnet',
  ETHEREUM: 'ethereum-sepolia',
  ARBITRUM: 'arbitrum-sepolia',
  BASE: 'base-sepolia',
  POLYGON: 'polygon-mumbai',
  AVALANCHE: 'avalanche-fuji'
};
