import { CctpNetworkAdapter, CctpNetworkId, CctpDomain } from './types';

export const CCTP_NETWORKS: Record<CctpNetworkId, CctpNetworkAdapter> = {
  [CctpNetworkId.SOLANA]: {
    id: CctpNetworkId.SOLANA,
    name: 'Solana',
    domain: CctpDomain.SOLANA,
    type: 'solana',
    logoUrl: '/chains/solana.svg',
    nativeCurrency: {
      symbol: 'SOL',
      decimals: 9,
      name: 'Solana',
    },
    usdcAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    tokenMessengerAddress: 'CCTPmbSD7gX1bxKPAmg77w8oFzNFpaQiQUWD43TKaecd',
    messageTransmitterAddress: 'CCTPiPYPc6AsJuwueEnWgSgucamXDZwBd53dQ11YiKX3',
    rpcUrl: import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://solscan.io',
  },
  [CctpNetworkId.ETHEREUM]: {
    id: CctpNetworkId.ETHEREUM,
    name: 'Ethereum',
    domain: CctpDomain.ETHEREUM,
    type: 'evm',
    logoUrl: '/chains/ethereum.svg',
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18,
      name: 'Ethereum',
    },
    usdcAddress: '0xA0b86a33E6441b8C4505b7c0c5b2c8b5c5c5c5c5',
    tokenMessengerAddress: '0xbd3fa81b58ba92a82136038b25adec7066af3155',
    messageTransmitterAddress: '0x0a992d191deec32afe36203ad87d7d289a738f81',
    rpcUrl: import.meta.env.VITE_ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/',
    explorerUrl: 'https://etherscan.io',
  },
  [CctpNetworkId.ARBITRUM]: {
    id: CctpNetworkId.ARBITRUM,
    name: 'Arbitrum',
    domain: CctpDomain.ARBITRUM,
    type: 'evm',
    logoUrl: '/chains/arbitrum.svg',
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18,
      name: 'Ethereum',
    },
    usdcAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    tokenMessengerAddress: '0x19330d10D9Cc8751218eaf51E8885D058642E08A',
    messageTransmitterAddress: '0xC30362313FBBA5cf9163F0bb16a0e01f01A896ca',
    rpcUrl: import.meta.env.VITE_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
  },
  [CctpNetworkId.BASE]: {
    id: CctpNetworkId.BASE,
    name: 'Base',
    domain: CctpDomain.BASE,
    type: 'evm',
    logoUrl: '/chains/base.svg',
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18,
      name: 'Ethereum',
    },
    usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    tokenMessengerAddress: '0x1682Ae6375C4E4A97e4B583BC394c861A46D8962',
    messageTransmitterAddress: '0xAD09780d193884d503182aD4588450C416D6F9D4',
    rpcUrl: import.meta.env.VITE_BASE_RPC_URL || 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
  },
  [CctpNetworkId.POLYGON]: {
    id: CctpNetworkId.POLYGON,
    name: 'Polygon',
    domain: CctpDomain.POLYGON,
    type: 'evm',
    logoUrl: '/chains/polygon.svg',
    nativeCurrency: {
      symbol: 'MATIC',
      decimals: 18,
      name: 'Polygon',
    },
    usdcAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    tokenMessengerAddress: '0x9daF8c91AEFAE50b9c0E69629D3F6Ca40cA3B3FE',
    messageTransmitterAddress: '0xF3be9355363857F3e001be68856A2f96b4C39Ba9',
    rpcUrl: import.meta.env.VITE_POLYGON_RPC_URL || 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
  },
  [CctpNetworkId.AVALANCHE]: {
    id: CctpNetworkId.AVALANCHE,
    name: 'Avalanche',
    domain: CctpDomain.AVALANCHE,
    type: 'evm',
    logoUrl: '/chains/avalanche.svg',
    nativeCurrency: {
      symbol: 'AVAX',
      decimals: 18,
      name: 'Avalanche',
    },
    usdcAddress: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    tokenMessengerAddress: '0x6B25532e1060CE10cc3B0A99e5683b91BFDe6982',
    messageTransmitterAddress: '0x8186359aF5F57FbB40c6b14A588d2A59C0C29880',
    rpcUrl: import.meta.env.VITE_AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
  },
};

export const getSupportedNetworks = (): CctpNetworkAdapter[] => {
  return Object.values(CCTP_NETWORKS);
};

export const getNetworkById = (id: CctpNetworkId): CctpNetworkAdapter | undefined => {
  return CCTP_NETWORKS[id];
};

export const getNetworkByDomain = (domain: CctpDomain): CctpNetworkAdapter | undefined => {
  return Object.values(CCTP_NETWORKS).find(network => network.domain === domain);
};
