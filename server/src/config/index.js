import dotenv from 'dotenv';
import { PublicKey } from '@solana/web3.js';

dotenv.config();

// Server Configuration
export const SERVER_CONFIG = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Solana Configuration
export const SOLANA_CONFIG = {
  network: process.env.SOLANA_NETWORK || 'devnet',
  rpcEndpoint: process.env.RPC_ENDPOINT || 'https://api.devnet.solana.com',
  usdcMint: new PublicKey(process.env.USDC_MINT || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'),
};

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: process.env.SUPABASE_URL,
  serviceKey: process.env.SUPABASE_SERVICE_KEY,
};

// AfriPay Business Configuration
export const AFRIPAY_CONFIG = {
  platformWallet: new PublicKey(process.env.AFRIPAY_PLATFORM_WALLET || 'EHwtMrGE6V5fH3xUKYcoHzbouUqfgB4jd7MsqfQfHVSn'),
  feeRate: parseFloat(process.env.AFRIPAY_FEE_RATE) || 0.029, // 2.9%
  fixedFeeUSD: parseFloat(process.env.AFRIPAY_FIXED_FEE_USD) || 0.30,
};

// Security Configuration
export const SECURITY_CONFIG = {
  rateLimit: parseInt(process.env.RATE_LIMIT) || 50,
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000, // 1 minute
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:8080'],
};

// Validation function
export const validateConfig = () => {
  const required = {
    'SUPABASE_URL': SUPABASE_CONFIG.url,
    'SUPABASE_SERVICE_KEY': SUPABASE_CONFIG.serviceKey,
  };

  for (const [key, value] of Object.entries(required)) {
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  console.log('✅ Configuration validated successfully');
  console.log(`🚀 Server will run on port ${SERVER_CONFIG.port}`);
  console.log(`🌐 Solana Network: ${SOLANA_CONFIG.network}`);
  console.log(`💳 USDC Mint: ${SOLANA_CONFIG.usdcMint.toString()}`);
  console.log(`💰 AfriPay Fee Rate: ${(AFRIPAY_CONFIG.feeRate * 100).toFixed(2)}%`);
};
