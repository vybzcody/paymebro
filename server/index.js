import express from 'express';
import morgan from 'morgan';
import { validateConfig, SERVER_CONFIG } from './src/config/index.js';
import { 
  corsMiddleware, 
  rateLimitMiddleware, 
  helmetMiddleware, 
  validateContentType,
  securityErrorHandler 
} from './src/middleware/security.js';

// Import routes
import paymentRouter from './src/routes/payment.js';
import createRouter from './src/routes/create.js';
import healthRouter from './src/routes/health.js';
import networkRouter from './src/routes/network.js';

// Validate configuration on startup
try {
  validateConfig();
} catch (error) {
  console.error('❌ Configuration validation failed:', error.message);
  process.exit(1);
}

// Create Express app
const app = express();

// Trust proxy (for rate limiting and IP detection)
app.set('trust proxy', 1);

// Security middleware (applied early)
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(rateLimitMiddleware);

// Logging middleware
app.use(morgan(SERVER_CONFIG.isDevelopment ? 'dev' : 'combined'));

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  type: ['application/json', 'text/plain']
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Content type validation
app.use(validateContentType);

// Health check routes (no auth required)
app.use('/health', healthRouter);
app.use('/api/network', networkRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AfriPay Backend API',
    version: '1.0.0',
    description: 'Solana Pay Protocol Compliant Payment Processing',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: SERVER_CONFIG.nodeEnv,
    endpoints: {
      payment: '/api/payment',
      create: '/api/create',
      health: '/health',
      documentation: '/docs'
    },
    features: [
      'Solana Pay Protocol Compliance',
      'AfriPay Fee Management',
      'Multi-currency Support (SOL/USDC)',
      'Transaction Verification',
      'Supabase Integration',
      'Rate Limiting & Security'
    ]
  });
});

// API routes
app.use('/api/payment', paymentRouter);
app.use('/api/create', createRouter);

// API documentation endpoint
app.get('/docs', (req, res) => {
  res.json({
    title: 'AfriPay Backend API Documentation',
    version: '1.0.0',
    baseUrl: `${req.protocol}://${req.get('host')}`,
    endpoints: {
      payment: {
        'GET /api/payment': {
          description: 'Get payment metadata for wallet display',
          parameters: {
            label: 'string (required) - Payment label',
            recipient: 'string (optional) - Recipient wallet address',
            amount: 'number (optional) - Payment amount'
          },
          example: '/api/payment?label=My%20Store&amount=10.50'
        },
        'POST /api/payment': {
          description: 'Create payment transaction (Solana Pay protocol)',
          parameters: {
            query: {
              recipient: 'string (required) - Recipient wallet',
              amount: 'number (required) - Payment amount',
              reference: 'string (required) - Unique reference key',
              'spl-token': 'string (optional) - SPL token mint address',
              memo: 'string (optional) - Transaction memo',
              message: 'string (optional) - Display message'
            },
            body: {
              account: 'string (required) - Payer wallet address'
            }
          },
          returns: {
            transaction: 'string - Base64 encoded transaction',
            message: 'string (optional) - Display message'
          }
        },
        'GET /api/payment/status/:reference': {
          description: 'Check payment status by reference',
          parameters: {
            reference: 'string (required) - Payment reference key'
          },
          returns: {
            status: 'string - pending|confirmed|failed',
            confirmed: 'boolean',
            signature: 'string (optional) - Transaction signature'
          }
        },
        'POST /api/payment/verify': {
          description: 'Verify and record completed payment',
          body: {
            signature: 'string (required) - Transaction signature',
            reference: 'string (required) - Payment reference'
          }
        }
      },
      create: {
        'POST /api/create': {
          description: 'Create new AfriPay payment request',
          body: {
            userId: 'string (required) - Merchant user ID',
            amount: 'number (required) - Payment amount',
            description: 'string (required) - Payment description',
            recipientWallet: 'string (required) - Merchant wallet',
            currency: 'string (optional) - USDC|SOL (default: USDC)',
            customerEmail: 'string (optional) - Customer email',
            customerName: 'string (optional) - Customer name',
            merchantName: 'string (optional) - Merchant name'
          },
          returns: {
            paymentRequest: 'object - Payment request details',
            feeBreakdown: 'object - Fee calculation breakdown',
            transactionDetails: 'object - Transaction details'
          }
        },
        'GET /api/create/:reference': {
          description: 'Get payment request details',
          parameters: {
            reference: 'string (required) - Payment reference key'
          }
        },
        'DELETE /api/create/:reference': {
          description: 'Cancel payment request',
          parameters: {
            reference: 'string (required) - Payment reference key'
          }
        }
      },
      health: {
        'GET /health': {
          description: 'Basic health check',
          returns: {
            status: 'string - healthy|unhealthy',
            services: 'object - Service status details'
          }
        },
        'GET /health/detailed': {
          description: 'Detailed system health information'
        },
        'GET /health/ready': {
          description: 'Kubernetes readiness probe'
        },
        'GET /health/live': {
          description: 'Kubernetes liveness probe'
        }
      }
    },
    examples: {
      createPayment: {
        url: 'POST /api/create',
        body: {
          userId: 'user-123',
          amount: 100.50,
          description: 'Coffee purchase',
          recipientWallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
          currency: 'USDC',
          customerEmail: 'customer@example.com',
          merchantName: 'Coffee Shop'
        }
      },
      solanaPayURL: 'solana:7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU?amount=100.50&spl-token=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU&reference=Fn3z4zRrRPD4UnCFAsZGMhbGPKWtyPcF3mS2HGvpyUGQ&label=AfriPay%20Payment&message=Coffee%20purchase',
      transactionRequest: {
        url: 'POST /api/payment?recipient=7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU&amount=100.50&reference=Fn3z4zRrRPD4UnCFAsZGMhbGPKWtyPcF3mS2HGvpyUGQ',
        body: {
          account: '5fNfvyp5T3BB9hJqpJ1L4V6LjdyNBz5Fz7VqjxP8qJSL'
        },
        returns: {
          transaction: 'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAg=='
        }
      }
    },
    errors: {
      400: 'Bad Request - Invalid parameters',
      403: 'Forbidden - CORS policy violation',
      404: 'Not Found - Resource not found',
      429: 'Too Many Requests - Rate limit exceeded',
      500: 'Internal Server Error - Server error'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /docs',
      'GET /api/payment',
      'POST /api/payment',
      'GET /api/payment/status/:reference',
      'POST /api/create',
      'GET /api/create/:reference'
    ]
  });
});

// Security error handler
app.use(securityErrorHandler);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Don't leak error details in production
  const errorMessage = SERVER_CONFIG.isDevelopment ? err.message : 'Internal server error';
  const errorStack = SERVER_CONFIG.isDevelopment ? err.stack : undefined;
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: errorMessage,
    timestamp: new Date().toISOString(),
    ...(errorStack && { stack: errorStack })
  });
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\\n🛑 Received SIGINT. Gracefully shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\\n🛑 Received SIGTERM. Gracefully shutting down...');
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️  Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in production to maintain availability
  if (SERVER_CONFIG.isDevelopment) {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Start server
const server = app.listen(SERVER_CONFIG.port, () => {
  console.log('\\n🚀 AfriPay Backend Server Started Successfully!');
  console.log('================================================');
  console.log(`📡 Server: http://localhost:${SERVER_CONFIG.port}`);
  console.log(`🌍 Environment: ${SERVER_CONFIG.nodeEnv}`);
  console.log(`🏥 Health Check: http://localhost:${SERVER_CONFIG.port}/health`);
  console.log(`📚 Documentation: http://localhost:${SERVER_CONFIG.port}/docs`);
  console.log('================================================');
  console.log('✅ Ready to process Solana Pay transactions!');
  
  if (SERVER_CONFIG.isDevelopment) {
    console.log('\\n🔧 Development Mode - Additional Info:');
    console.log('   - Hot reload: Not enabled (use nodemon)');
    console.log('   - Error details: Exposed in responses');
    console.log('   - CORS: Permissive for development');
    console.log('   - Rate limiting: Reduced for testing');
  }
});

export default app;
