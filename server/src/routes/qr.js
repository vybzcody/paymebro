import express from 'express';
import { PublicKey, Keypair } from '@solana/web3.js';
import { encodeURL } from '@solana/pay';
import BigNumber from 'bignumber.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// USDC mint addresses - using widely recognized devnet USDC
const USDC_DEVNET = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'); // Circle's devnet USDC
const USDC_MAINNET = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // Circle's mainnet USDC

const getTokenMint = (currency) => {
  if (currency === 'SOL') {
    return undefined; // Native SOL doesn't need a mint
  }
  return process.env.SOLANA_NETWORK === 'mainnet-beta' ? USDC_MAINNET : USDC_DEVNET;
};

// Create QR Code with Solana Pay URL
router.post('/create', async (req, res) => {
  try {
    const { walletAddress, title, amount, currency = 'USDC' } = req.body;

    console.log('QR Create Request Body:', req.body);
    console.log('Extracted currency:', currency);
    console.log('Currency type:', typeof currency);

    if (!walletAddress || !title || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get or create user
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();

    if (userError && userError.code === 'PGRST116') {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          wallet_address: walletAddress,
          web3auth_user_id: walletAddress,
          login_provider: 'wallet'
        })
        .select('id')
        .single();

      if (createError) throw createError;
      user = newUser;
    } else if (userError) {
      throw userError;
    }

    // Generate reference keypair
    const referenceKeypair = Keypair.generate();
    
    // Get token mint based on currency
    const tokenMint = getTokenMint(currency);
    console.log('Currency:', currency, 'Token Mint:', tokenMint?.toString() || 'undefined (SOL)');
    
    // Create Solana Pay URL with proper token handling
    const transferRequestBase = {
      recipient: new PublicKey(walletAddress),
      amount: new BigNumber(amount),
      reference: referenceKeypair.publicKey,
      label: title,
      message: `Payment for ${title}`
    };

    // Add token mint only for USDC, not for SOL
    const transferRequest = currency === 'SOL' 
      ? transferRequestBase
      : { ...transferRequestBase, splToken: tokenMint };

    console.log('Transfer request object:', transferRequest);

    const solanaPayURL = encodeURL(transferRequest);
    const paymentUrl = solanaPayURL.toString();
    
    // Generate QR code from the Solana Pay URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&margin=10&data=${encodeURIComponent(paymentUrl)}`;

    console.log('Generated Solana Pay URL:', paymentUrl);
    console.log('QR Code URL:', qrCodeUrl);

    // Save to database
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .insert({
        user_id: user.id,
        title,
        amount: parseFloat(amount),
        currency,
        reference: referenceKeypair.publicKey.toString(),
        payment_url: paymentUrl,
        qr_code_url: qrCodeUrl
      })
      .select()
      .single();

    if (error) throw error;

    // Add reference to monitoring
    const { transactionMonitor } = await import('../services/transactionMonitor.js');
    transactionMonitor.addReference(referenceKeypair.publicKey.toString());

    res.json(qrCode);
  } catch (error) {
    console.error('Error creating QR code:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test QR generation
router.get('/test', (req, res) => {
  const testUrl = 'solana:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v?amount=10&spl-token=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU&reference=test123&label=Test%20Payment';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&margin=10&data=${encodeURIComponent(testUrl)}`;
  
  res.json({
    solanaPayUrl: testUrl,
    qrCodeUrl: qrUrl,
    message: 'Test QR generation'
  });
});

export default router;
