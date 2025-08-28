import express from 'express';
import { query, validationResult } from 'express-validator';
import { supabase } from '../services/database.js';

const router = express.Router();

/**
 * GET /api/metrics
 * Get business metrics for a merchant
 */
router.get('/', [
  query('merchantId').notEmpty().withMessage('Merchant ID is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { merchantId } = req.query;

    console.log('📊 Fetching business metrics for merchant:', merchantId);

    // Get total revenue from confirmed transactions
    const { data: revenueData, error: revenueError } = await supabase
      .from('transactions')
      .select('net_amount')
      .eq('user_id', merchantId)
      .eq('status', 'confirmed');

    if (revenueError) throw revenueError;

    const totalRevenue = revenueData?.reduce((sum, tx) => sum + parseFloat(tx.net_amount || 0), 0) || 0;

    // Get total transaction count
    const { count: totalTransactions, error: countError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', merchantId);

    if (countError) throw countError;

    // Get success rate
    const { count: successfulTransactions, error: successError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', merchantId)
      .eq('status', 'confirmed');

    if (successError) throw successError;

    const successRate = totalTransactions ? (successfulTransactions / totalTransactions) * 100 : 0;

    // Get active customers count
    const { count: activeCustomers, error: customersError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', merchantId);

    if (customersError) throw customersError;

    // Get payment links count
    const { count: paymentLinks, error: linksError } = await supabase
      .from('payment_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', merchantId);

    if (linksError) throw linksError;

    const metrics = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalTransactions: totalTransactions || 0,
      successRate: Math.round(successRate * 10) / 10,
      activeCustomers: activeCustomers || 0,
      paymentLinks: paymentLinks || 0,
      monthlyGrowth: 0 // TODO: Calculate based on previous month data
    };

    console.log('📊 Business metrics:', metrics);

    res.json({
      success: true,
      metrics
    });

  } catch (error) {
    console.error('Error in GET /api/metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
