import express from 'express';
import { solanaService } from '../services/solana.js';
import { databaseService } from '../services/database.js';
import { SERVER_CONFIG, SOLANA_CONFIG, AFRIPAY_CONFIG } from '../config/index.js';

const router = express.Router();

/**
 * GET /health - Basic health check
 */
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check database connectivity
    const dbHealthy = await databaseService.healthCheck();
    
    // Check Solana connectivity  
    const solanaHealth = await solanaService.healthCheck();
    
    const responseTime = Date.now() - startTime;
    
    const health = {
      status: dbHealthy && solanaHealth.healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      version: '1.0.0',
      environment: SERVER_CONFIG.nodeEnv,
      services: {
        database: {
          status: dbHealthy ? 'healthy' : 'unhealthy',
          connected: dbHealthy
        },
        solana: {
          status: solanaHealth.healthy ? 'healthy' : 'unhealthy',
          network: SOLANA_CONFIG.network,
          rpcEndpoint: SOLANA_CONFIG.rpcEndpoint,
          currentSlot: solanaHealth.slot,
          version: solanaHealth.version,
          ...(solanaHealth.error && { error: solanaHealth.error })
        }
      },
      configuration: {
        network: SOLANA_CONFIG.network,
        usdcMint: SOLANA_CONFIG.usdcMint.toString(),
        platformWallet: AFRIPAY_CONFIG.platformWallet.toString(),
        feeRate: `${(AFRIPAY_CONFIG.feeRate * 100).toFixed(2)}%`,
        fixedFeeUSD: `$${AFRIPAY_CONFIG.fixedFeeUSD}`
      }
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);

  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      services: {
        database: { status: 'unknown' },
        solana: { status: 'unknown' }
      }
    });
  }
});

/**
 * GET /health/detailed - Detailed system information
 */
router.get('/detailed', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Gather detailed system information
    const [dbHealth, solanaHealth] = await Promise.allSettled([
      databaseService.healthCheck(),
      solanaService.healthCheck()
    ]);

    // Process database health
    const dbHealthy = dbHealth.status === 'fulfilled' && dbHealth.value;
    
    // Process Solana health
    const solanaHealthy = solanaHealth.status === 'fulfilled' && solanaHealth.value.healthy;
    const solanaData = solanaHealth.status === 'fulfilled' ? solanaHealth.value : { healthy: false, error: 'Failed to check' };

    // System metrics
    const systemInfo = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid
    };

    const detailed = {
      status: dbHealthy && solanaHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${Date.now() - startTime}ms`,
      version: '1.0.0',
      environment: SERVER_CONFIG.nodeEnv,
      system: systemInfo,
      services: {
        database: {
          status: dbHealthy ? 'healthy' : 'unhealthy',
          connected: dbHealthy,
          ...(dbHealth.status === 'rejected' && { error: dbHealth.reason?.message })
        },
        solana: {
          status: solanaHealthy ? 'healthy' : 'unhealthy',
          network: SOLANA_CONFIG.network,
          rpcEndpoint: SOLANA_CONFIG.rpcEndpoint,
          ...solanaData
        }
      },
      configuration: {
        server: {
          port: SERVER_CONFIG.port,
          nodeEnv: SERVER_CONFIG.nodeEnv
        },
        solana: {
          network: SOLANA_CONFIG.network,
          rpcEndpoint: SOLANA_CONFIG.rpcEndpoint,
          usdcMint: SOLANA_CONFIG.usdcMint.toString()
        },
        afripay: {
          platformWallet: AFRIPAY_CONFIG.platformWallet.toString(),
          feeRate: AFRIPAY_CONFIG.feeRate,
          fixedFeeUSD: AFRIPAY_CONFIG.fixedFeeUSD
        }
      },
      endpoints: {
        payment: '/api/payment',
        create: '/api/create',
        health: '/health',
        docs: '/docs'
      }
    };

    const statusCode = detailed.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(detailed);

  } catch (error) {
    console.error('Detailed health check error:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: SERVER_CONFIG.isDevelopment ? error.stack : undefined
    });
  }
});

/**
 * GET /health/ready - Readiness probe for Kubernetes
 */
router.get('/ready', async (req, res) => {
  try {
    // Quick readiness check
    const dbHealthy = await databaseService.healthCheck();
    const solanaHealth = await solanaService.healthCheck();
    
    if (dbHealthy && solanaHealth.healthy) {
      res.status(200).json({ 
        ready: true, 
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({ 
        ready: false, 
        timestamp: new Date().toISOString(),
        issues: [
          ...(!dbHealthy ? ['database'] : []),
          ...(!solanaHealth.healthy ? ['solana'] : [])
        ]
      });
    }
  } catch (error) {
    res.status(503).json({ 
      ready: false, 
      timestamp: new Date().toISOString(),
      error: error.message 
    });
  }
});

/**
 * GET /health/live - Liveness probe for Kubernetes
 */
router.get('/live', (req, res) => {
  res.status(200).json({ 
    alive: true, 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
