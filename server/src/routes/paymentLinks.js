import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Create Payment Link
router.post('/create', async (req, res) => {
  try {
    const { walletAddress, title, description, amount, currency = 'USDC' } = req.body;

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
          web3auth_user_id: walletAddress
        })
        .select('id')
        .single();

      if (createError) throw createError;
      user = newUser;
    } else if (userError) {
      throw userError;
    }

    // Generate reference
    const reference = Math.random().toString(36).substring(2, 10);
    
    // Create payment page URL (for web interface)
    const paymentUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/pay/${reference}`;

    // Save to database
    const { data: paymentLink, error } = await supabase
      .from('payment_links')
      .insert({
        user_id: user.id,
        title,
        description,
        amount: parseFloat(amount),
        currency,
        reference,
        payment_url: paymentUrl
      })
      .select()
      .single();

    if (error) throw error;

    res.json(paymentLink);
  } catch (error) {
    console.error('Error creating payment link:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
