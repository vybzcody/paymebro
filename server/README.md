# AfriPay Backend Server

A **Solana Pay Protocol Compliant** backend server for AfriPay payment processing.

## 🚀 Features

- ✅ **Solana Pay Protocol Compliance** - Full implementation of the official specification
- ✅ **AfriPay Fee Management** - Stripe-like 2.9% + $0.30 fee structure
- ✅ **Multi-currency Support** - SOL and USDC payments
- ✅ **Transaction Verification** - Blockchain transaction validation
- ✅ **Supabase Integration** - Database operations and user management
- ✅ **Security & Rate Limiting** - CORS, Helmet, and rate limiting middleware
- ✅ **Health Monitoring** - Comprehensive health checks for all services
- ✅ **API Documentation** - Built-in endpoint documentation

## 🏗️ Architecture

```
├── src/
│   ├── config/           # Environment and configuration management
│   ├── middleware/       # Security, CORS, rate limiting
│   ├── routes/          # API endpoints
│   │   ├── payment.js   # Solana Pay protocol endpoints
│   │   ├── create.js    # Payment request creation
│   │   └── health.js    # Health checks and monitoring
│   └── services/        # Business logic services
│       ├── database.js  # Supabase database operations
│       └── solana.js    # Solana blockchain operations
├── .env                 # Environment variables
├── package.json         # Dependencies and scripts
└── index.js            # Main server application
```

## 🛠️ Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Copy and update the environment variables:

```bash
cp .env.example .env
```

Required environment variables:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Solana Configuration
SOLANA_NETWORK=devnet
RPC_ENDPOINT=https://api.devnet.solana.com
USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here

# AfriPay Configuration  
AFRIPAY_PLATFORM_WALLET=EHwtMrGE6V5fH3xUKYcoHzbouUqfgB4jd7MsqfQfHVSn
AFRIPAY_FEE_RATE=0.029
AFRIPAY_FIXED_FEE_USD=0.30

# Security Configuration
RATE_LIMIT=50
RATE_LIMIT_WINDOW=60000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8080
```

### 3. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## 📚 API Endpoints

### Solana Pay Protocol Endpoints

#### `GET /api/payment`
Get payment metadata for wallet display.

**Query Parameters:**
- `label` (required) - Payment label
- `recipient` (optional) - Recipient wallet address  
- `amount` (optional) - Payment amount

**Example:**
```
GET /api/payment?label=My%20Store&amount=10.50
```

#### `POST /api/payment`
Create payment transaction (Solana Pay protocol compliant).

**Query Parameters:**
- `recipient` (required) - Recipient wallet
- `amount` (required) - Payment amount
- `reference` (required) - Unique reference key
- `spl-token` (optional) - SPL token mint address
- `memo` (optional) - Transaction memo
- `message` (optional) - Display message

**Request Body:**
```json
{
  "account": "5fNfvyp5T3BB9hJqpJ1L4V6LjdyNBz5Fz7VqjxP8qJSL"
}
```

**Response:**
```json
{
  "transaction": "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAg==",
  "message": "Coffee purchase"
}
```

### Payment Management Endpoints

#### `POST /api/create`
Create new AfriPay payment request.

**Request Body:**
```json
{
  "userId": "user-123",
  "amount": 100.50,
  "description": "Coffee purchase",
  "recipientWallet": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "currency": "USDC",
  "customerEmail": "customer@example.com",
  "merchantName": "Coffee Shop"
}
```

**Response:**
```json
{
  "paymentRequest": {
    "id": "pr_123",
    "reference": "Fn3z4zRrRPD4UnCFAsZGMhbGPKWtyPcF3mS2HGvpyUGQ",
    "paymentUrl": "solana:7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU?amount=103.41&spl-token=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU&reference=Fn3z4zRrRPD4UnCFAsZGMhbGPKWtyPcF3mS2HGvpyUGQ&label=Coffee%20Shop&message=Coffee%20purchase",
    "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=...",
    "expiresAt": "2024-08-26T05:17:50.000Z"
  },
  "feeBreakdown": {
    "originalAmount": 100.50,
    "afripayFee": 3.21,
    "merchantReceives": 100.50,
    "total": 103.71
  }
}
```

### Health & Monitoring

#### `GET /health`
Basic health check for all services.

#### `GET /health/detailed`
Detailed system health information.

#### `GET /docs`
Interactive API documentation.

## 🔒 Security Features

- **CORS Protection** - Configurable origin restrictions
- **Rate Limiting** - IP-based request limiting
- **Helmet Security Headers** - Standard security headers
- **Input Validation** - Request parameter validation
- **Error Handling** - Secure error responses

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3001/health
```

### Create Payment Request
```bash
curl -X POST http://localhost:3001/api/create \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": "test-user",
    "amount": 10.50,
    "description": "Test payment",
    "recipientWallet": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "currency": "USDC"
  }'
```

### Transaction Request (Solana Pay Protocol)
```bash
curl -X POST "http://localhost:3001/api/payment?recipient=7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU&amount=10.50&reference=Fn3z4zRrRPD4UnCFAsZGMhbGPKWtyPcF3mS2HGvpyUGQ&spl-token=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU" \\
  -H "Content-Type: application/json" \\
  -d '{
    "account": "5fNfvyp5T3BB9hJqpJ1L4V6LjdyNBz5Fz7VqjxP8qJSL"
  }'
```

## 🔗 Integration with Frontend

Update your frontend to use the new backend:

```javascript
// Create payment request
const response = await fetch('http://localhost:3001/api/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: currentUser.id,
    amount: 100.50,
    description: 'Product purchase',
    recipientWallet: currentUser.walletAddress,
    currency: 'USDC',
    merchantName: 'My Store'
  })
});

const { paymentRequest, feeBreakdown } = await response.json();

// Use paymentRequest.paymentUrl for QR code or deep linking
// Use paymentRequest.reference to monitor payment status
```

## 📊 Monitoring & Logs

The server provides comprehensive logging and monitoring:

- **Request Logs** - All API requests logged with Morgan
- **Error Logs** - Detailed error tracking
- **Health Metrics** - Service status monitoring
- **Performance Tracking** - Response time monitoring

## 🚀 Deployment

### Production Environment

1. Set `NODE_ENV=production`
2. Configure proper database URLs
3. Set strong rate limits
4. Use HTTPS in production
5. Configure proper CORS origins
6. Use a process manager (PM2, systemd)

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Follow existing code style
2. Add tests for new features
3. Update documentation
4. Test with real Solana devnet transactions

## 📄 License

Same as main AfriPay project.
