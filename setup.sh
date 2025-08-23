#!/bin/bash

# AfriPay Setup Script
echo "🚀 Setting up AfriPay - Solana Payment Dashboard (Devnet)"
echo "========================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
fi

echo "📦 Installing dependencies..."
npm install

echo "🗄️  Setting up local Supabase..."
supabase init

echo "🚀 Starting Supabase services..."
supabase start

echo "📊 Running database migrations..."
supabase db reset

echo "🔧 Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo "⚠️  Please update the following environment variables in .env:"
    echo "   - VITE_WEB3AUTH_CLIENT_ID (get from https://dashboard.web3auth.io/)"
    echo "   - VITE_SUPABASE_URL (will be shown below)"
    echo "   - VITE_SUPABASE_ANON_KEY (will be shown below)"
    echo ""
    echo "📝 Note: The app is configured for Solana DEVNET by default"
    echo "   - USDC Mint: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
    echo "   - RPC: https://api.devnet.solana.com"
    echo "   - You'll need devnet SOL and USDC for testing"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Get your Web3Auth Client ID:"
echo "   - Go to https://dashboard.web3auth.io/"
echo "   - Create a new project"
echo "   - Select 'Plug and Play' -> 'Modal'"
echo "   - Choose 'Solana' as blockchain"
echo "   - Add 'http://localhost:5173' to allowed origins"
echo "   - Copy the Client ID"
echo ""
echo "2. Update your .env file with the credentials shown below"
echo ""
echo "3. Get devnet tokens for testing:"
echo "   - SOL: https://faucet.solana.com/"
echo "   - USDC: https://spl-token-faucet.com/"
echo ""
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "🔑 Your Supabase credentials:"
supabase status

echo ""
echo "📚 Useful commands:"
echo "  npm run dev          - Start development server"
echo "  supabase start       - Start Supabase services"
echo "  supabase stop        - Stop Supabase services"
echo "  supabase db reset    - Reset database with fresh migrations"
echo "  supabase studio      - Open Supabase Studio"
echo "  supabase functions deploy - Deploy edge functions"
echo ""
echo "🌐 Access points:"
echo "  Frontend: http://localhost:5173"
echo "  Supabase Studio: http://localhost:54323"
echo "  Supabase API: http://localhost:54321"
echo ""
echo "🧪 Testing resources:"
echo "  Solana Explorer (Devnet): https://explorer.solana.com?cluster=devnet"
echo "  SOL Faucet: https://faucet.solana.com/"
echo "  USDC Faucet: https://spl-token-faucet.com/"
