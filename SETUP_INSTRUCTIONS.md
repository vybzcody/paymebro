# AfriPay Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Get Web3Auth Client ID**
   - Go to [Web3Auth Dashboard](https://dashboard.web3auth.io/)
   - Create a new project
   - Select "Plug and Play" → "Modal"
   - Choose "Solana" as blockchain
   - Add `http://localhost:5173` to allowed origins
   - Copy the Client ID

3. **Update Environment Variables**
   - Open `.env` file
   - Replace `your_web3auth_client_id_here` with your actual Client ID

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Current Integration Status

✅ **Completed:**
- Landing page is now the default route (`/`)
- Web3Auth integration for wallet connection
- Protected routes for dashboard pages
- User authentication flow
- Logout functionality
- Loading states and error handling

✅ **Ready to Test:**
- Visit `http://localhost:5173`
- Click "Connect Wallet" on landing page
- Complete Web3Auth login flow
- Access protected dashboard routes

## Next Steps

1. **Set up Supabase** (optional for full functionality):
   ```bash
   ./setup.sh
   ```

2. **Get Devnet Tokens** for testing:
   - SOL: https://faucet.solana.com/
   - USDC: https://spl-token-faucet.com/

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Authentication**: Web3Auth (wallet-based)
- **Database**: Supabase (when set up)
- **Blockchain**: Solana Devnet
- **Payments**: Solana Pay + USDC

## Key Features Integrated

1. **Wallet Authentication**: Users connect via Web3Auth
2. **Protected Routes**: Dashboard requires authentication
3. **User Management**: Profile data synced with wallet
4. **Responsive Design**: Works on desktop and mobile
5. **Loading States**: Smooth UX during authentication

## File Structure

```
src/
├── contexts/
│   └── Web3AuthContext.tsx     # Web3Auth provider
├── hooks/
│   └── useAuth.ts              # Authentication hook
├── components/
│   ├── DashboardHeader.tsx     # Header with user dropdown
│   ├── LoadingSpinner.tsx      # Loading component
│   └── Layout.tsx              # Protected layout wrapper
├── pages/
│   └── Landing.tsx             # Landing page with login
└── App.tsx                     # Main app with routing
```

## Environment Variables

```env
# Required for Web3Auth
VITE_WEB3AUTH_CLIENT_ID=your_client_id_here

# Solana Configuration (Devnet)
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

# App Configuration
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=AfriPay
```
