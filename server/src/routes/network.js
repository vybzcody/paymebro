import express from 'express';
import { SOLANA_CONFIG } from '../config/index.js';
import { solanaService } from '../services/solana.js';

const router = express.Router();

/**
 * GET /api/network - Get network information
 */
router.get('/', async (req, res) => {
  try {
    const networkInfo = {
      network: SOLANA_CONFIG.network,
      rpcEndpoint: SOLANA_CONFIG.rpcEndpoint,
      usdcMint: SOLANA_CONFIG.usdcMint.toString(),
      timestamp: new Date().toISOString()
    };

    // Test connection
    try {
      const slot = await solanaService.connection.getSlot();
      networkInfo.connected = true;
      networkInfo.currentSlot = slot;
    } catch (error) {
      networkInfo.connected = false;
      networkInfo.connectionError = error.message;
    }

    res.json(networkInfo);
  } catch (error) {
    console.error('Network info error:', error);
    res.status(500).json({
      error: 'Failed to get network information',
      message: error.message
    });
  }
});

/**
 * GET /api/network/check/:address - Check if wallet exists on network
 */
router.get('/check/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Validate address format
    let publicKey;
    try {
      const { PublicKey } = await import('@solana/web3.js');
      publicKey = new PublicKey(address);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid address',
        message: 'The provided address is not a valid Solana public key'
      });
    }

    // Check if account exists
    const accountInfo = await solanaService.connection.getAccountInfo(publicKey);
    const balance = await solanaService.connection.getBalance(publicKey);

    const result = {
      address: address,
      network: SOLANA_CONFIG.network,
      exists: accountInfo !== null,
      balance: {
        lamports: balance,
        sol: balance / 1e9
      },
      accountInfo: accountInfo ? {
        owner: accountInfo.owner.toString(),
        executable: accountInfo.executable,
        rentEpoch: accountInfo.rentEpoch
      } : null,
      recommendations: []
    };

    // Add recommendations
    if (!accountInfo) {
      result.recommendations.push({
        issue: 'Account not found',
        solution: `Get ${SOLANA_CONFIG.network} SOL from https://faucet.solana.com`,
        priority: 'high'
      });
    } else if (balance < 5000) { // Less than 0.000005 SOL
      result.recommendations.push({
        issue: 'Low balance for transaction fees',
        solution: `Get more ${SOLANA_CONFIG.network} SOL from https://faucet.solana.com`,
        priority: 'medium'
      });
    } else {
      result.recommendations.push({
        issue: 'None',
        solution: 'Wallet is ready for transactions',
        priority: 'low'
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Address check error:', error);
    res.status(500).json({
      error: 'Failed to check address',
      message: error.message
    });
  }
});

export default router;
