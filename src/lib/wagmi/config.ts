// USDC contract addresses for different chains
export const usdcAddresses = {
  // Mainnet addresses
  1: '0xA0b86a33E6441b8C4505E2c52C7E8c4b7E8e8e8e', // Ethereum
  137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // Polygon
  43114: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // Avalanche
  42161: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', // Arbitrum
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base
  
  // Testnet addresses
  11155111: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia
  80002: '0x9999f7Fea5938fD3b1E26A12c3f2fb024e194f97', // Polygon Mumbai
  43113: '0x5425890298aed601595a70AB815c96711a31Bc65', // Avalanche Fuji
  421614: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // Arbitrum Sepolia
  84532: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia
} as const;

export type SupportedChainId = keyof typeof usdcAddresses;
