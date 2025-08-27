# 🚀 AfriPay Backend Setup Guide

This guide will walk you through setting up the new **Solana Pay Protocol Compliant** backend for AfriPay.

## 🔧 What We've Built

Based on the Solana Pay point-of-sale example, we've created a complete backend that fixes the critical issues in your implementation:

### ✅ Fixed Issues:
1. **Solana Pay Protocol Compliance** - Now follows official specification
2. **Missing Backend API** - Complete Express.js server with proper endpoints
3. **Transaction Creation** - Proper transaction serialization/deserialization
4. **Security & CORS** - Production-ready security middleware
5. **Rate Limiting** - Protection against abuse
6. **Error Handling** - Proper error responses and logging

### 🏗️ New Architecture:

```
afripay/
├── src/                    # Frontend (React/Vite)
├── server/                 # NEW: Backend (Express.js)
│   ├── src/
│   │   ├── config/         # Environment configuration
│   │   ├── middleware/     # Security, CORS, rate limiting
│   │   ├── routes/         # API endpoints
│   │   │   ├── payment.js  # Solana Pay protocol endpoints
│   │   │   ├── create.js   # Payment request creation
│   │   │   └── health.js   # Health checks
│   │   └── services/       # Business logic
│   │       ├── database.js # Supabase operations
│   │       └── solana.js   # Blockchain operations
│   ├── package.json        # Backend dependencies
│   └── index.js           # Main server
├── supabase/              # Database (existing)
└── package.json           # Updated with backend scripts
```

## 🚀 Quick Setup

### Step 1: Install Backend Dependencies

```bash
# From the main afripay directory
npm run setup
```

This will install both frontend and backend dependencies.

### Step 2: Configure Backend Environment

Navigate to the server directory and set up environment variables:

```bash
cd server
cp .env.example .env
```

**Update `server/.env` with your actual values:**

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Solana Configuration
SOLANA_NETWORK=devnet
RPC_ENDPOINT=https://api.devnet.solana.com
USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

# Supabase Configuration (copy from main .env)
SUPABASE_URL=your_actual_supabase_url
SUPABASE_SERVICE_KEY=your_actual_service_key

# AfriPay Configuration
AFRIPAY_PLATFORM_WALLET=EHwtMrGE6V5fH3xUKYcoHzbouUqfgB4jd7MsqfQfHVSn
AFRIPAY_FEE_RATE=0.029
AFRIPAY_FIXED_FEE_USD=0.30

# Security Configuration
RATE_LIMIT=50
RATE_LIMIT_WINDOW=60000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8080
```

### Step 3: Start Both Frontend and Backend

```bash
# From the main afripay directory
npm run dev:full
```

This starts both:
- Backend server: `http://localhost:3001`
- Frontend app: `http://localhost:5173`

## 🧪 Test the Setup

### 1. Health Check
```bash
curl http://localhost:3001/health
```

### 2. API Documentation
Visit: `http://localhost:3001/docs`

### 3. Create a Payment Request
```bash
curl -X POST http://localhost:3001/api/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "amount": 10.50,
    "description": "Test payment",
    "recipientWallet": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "currency": "USDC",
    "merchantName": "Test Store"
  }'
```

## 🔌 Frontend Integration

Your existing frontend needs to be updated to use the new backend. Here's how:

### Option 1: Update Environment Variables

Add to your main `.env` file:

```bash
# Backend API Configuration
VITE_API_URL=http://localhost:3001
```

### Option 2: Create New Service File

Create `src/services/afripayAPI.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class AfriPayAPI {
  // Create payment request using new backend
  static async createPaymentRequest(data: {
    userId: string;
    amount: number;
    description: string;
    recipientWallet: string;
    currency?: 'SOL' | 'USDC';
    customerEmail?: string;
    customerName?: string;
    merchantName?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Check payment status
  static async checkPaymentStatus(reference: string) {
    const response = await fetch(`${API_BASE_URL}/api/payment/status/${reference}`);
    return response.json();
  }

  // Verify completed payment
  static async verifyPayment(signature: string, reference: string) {
    const response = await fetch(`${API_BASE_URL}/api/payment/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ signature, reference }),
    });

    return response.json();
  }
}
```

### Option 3: Update Your Existing Hook

Update your `useSolanaPay` hook to use the backend:

```typescript
// Replace the client-side payment creation with API call
const createPayment = useCallback(async (paymentData: PaymentData) => {
  try {
    setPaymentStatus({ status: 'creating' });

    // Use new backend API
    const result = await AfriPayAPI.createPaymentRequest({
      userId: user?.id || 'anonymous',
      amount: paymentData.amount,
      description: paymentData.message,
      recipientWallet: publicKey?.toString() || '',
      currency: paymentData.currency,
      customerEmail: paymentData.customerEmail,
      customerName: paymentData.customerName,
      merchantName: paymentData.label
    });

    setPaymentStatus({
      status: 'pending',
      paymentUrl: result.paymentRequest.paymentUrl,
      qrCodeUrl: result.paymentRequest.qrCodeUrl,
      reference: new PublicKey(result.paymentRequest.reference),
      breakdown: result.feeBreakdown
    });

    return {
      paymentUrl: result.paymentRequest.paymentUrl,
      qrCodeUrl: result.paymentRequest.qrCodeUrl,
      reference: new PublicKey(result.paymentRequest.reference)
    };
  } catch (error: any) {
    setPaymentStatus({ status: 'failed', error: error.message });
    throw error;
  }
}, [publicKey, user]);
```

## 🔄 Migration Steps

### Step 1: Gradually Move Logic to Backend
- Start by using backend for new payment requests
- Keep existing client-side logic as fallback
- Gradually migrate all payment operations

### Step 2: Update Components
- Update QR code generation to use backend URLs
- Update payment monitoring to use backend status endpoints
- Update transaction verification to use backend

### Step 3: Clean Up Client-Side Code
- Remove client-side Solana Pay logic
- Keep only wallet connection and user interface
- Remove complex blockchain operations from frontend

## 📈 Benefits of New Backend

### 🛡️ Security
- Proper CORS configuration
- Rate limiting protection
- Input validation
- Secure error handling

### ⚡ Performance  
- Server-side transaction creation
- Cached blockchain operations
- Optimized database queries

### 🔧 Maintainability
- Separation of concerns
- Clean API interfaces
- Comprehensive logging
- Health monitoring

### 📱 Wallet Compatibility
- Full Solana Pay protocol compliance
- Better mobile wallet support
- Standardized transaction format

## 🚨 Important Notes

### Database Compatibility
The backend works with your existing Supabase database structure. No migration required.

### Existing Features
All your current features (Web3Auth, dashboard, analytics) remain unchanged.

### Gradual Migration
You can deploy the backend and gradually migrate features without breaking existing functionality.

## 🐛 Troubleshooting

### Backend Won't Start
1. Check if port 3001 is available
2. Verify environment variables are set
3. Check Supabase credentials

### API Calls Failing
1. Verify CORS settings in backend
2. Check if both servers are running
3. Verify API URL in frontend

### Transaction Issues
1. Check Solana network connectivity
2. Verify wallet addresses are valid
3. Check transaction logs in backend

## 🚀 Deployment

For production deployment:

1. Set `NODE_ENV=production` in backend
2. Use proper production database URLs  
3. Configure production CORS origins
4. Set up SSL/HTTPS
5. Use a process manager (PM2, systemd)

## 📞 Support

If you encounter issues:

1. Check backend logs for errors
2. Test API endpoints directly with curl
3. Verify Supabase connection
4. Check Solana network status

The backend includes comprehensive health checks at `/health` to help diagnose issues.
