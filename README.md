# AfriPay - Solana Payment Platform

**The fastest way to accept Solana payments with Web3Auth integration**

AfriPay combines MetaMask Embedded Wallets (Web3Auth) with Solana's speed to create the most user-friendly payment platform for businesses and consumers worldwide.

## 🚀 Key Features

### ⚡ Instant Payments
- **0.4 second confirmations** on Solana network
- **Real-time payment tracking** with live dashboard
- **Multi-currency support** (SOL, USDC)

### 🔐 Seamless Authentication
- **Web3Auth integration** - No seed phrases needed
- **Social login** (Google, Discord, Twitter)
- **Seedless wallet creation** in 30 seconds

### 💰 Business Tools
- **QR code payments** for mobile transactions
- **Email invoicing** with professional templates
- **Payment links** for online sales
- **Recurring subscriptions** with automated billing
- **Group payment splitting** for shared expenses

### 📊 Professional Dashboard
- **Real-time analytics** with live revenue tracking
- **Currency conversion** (USD/SOL/USDC display)
- **Fee transparency** showing merchant vs platform revenue
- **Transaction history** with detailed reporting

## 🛠 Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: Web3Auth (MetaMask Embedded Wallets)
- **Blockchain**: Solana + Solana Pay
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend API
- **Deployment**: Vercel

## 🏆 MetaMask Embedded Wallets Hackathon

AfriPay is built for the **"Programmable Commerce & DeFi for Everyone"** track, featuring:

- ✅ **Web3Auth SDK integration** for seedless wallets
- ✅ **Solana blockchain deployment** with instant payments
- ✅ **Automated commerce features** (subscriptions, group payments)
- ✅ **Real-world utility** for businesses and consumers
- ✅ **Professional UX** with social login and email workflows

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Web3Auth account
- Resend account (for emails)

### Installation

```bash
# Clone the repository
git clone https://github.com/vybzcody/afri-pay-hub.git
cd afri-pay-hub

# Install dependencies
npm install
cd server && npm install && cd ..

# Configure environment variables
cp .env.example .env
cp server/.env.example server/.env
# Add your API keys to both .env files

# Start development servers
npm run dev:full
```

### Environment Variables

**Frontend (.env):**
```env
VITE_WEB3AUTH_CLIENT_ID=your_web3auth_client_id
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:3001
```

**Backend (server/.env):**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
RESEND_API_KEY=your_resend_api_key
AFRIPAY_FEE_RATE=0.029
```

## 💡 How It Works

### For Merchants
1. **Sign up** with social login (Google, Discord, Twitter)
2. **Create payments** via QR codes, links, or invoices
3. **Set your price** - customers pay total (your amount + fees)
4. **Receive payments** instantly to your Solana wallet
5. **Track revenue** with real-time USD conversion

### For Customers
1. **Scan QR code** or click payment link
2. **Connect wallet** or create one with social login
3. **Pay instantly** with SOL or USDC
4. **Get confirmation** in 0.4 seconds

### Fee Structure
- **2.9% + $0.30** per transaction (competitive with traditional processors)
- **Merchant receives** exactly what they charge
- **Customer pays** total amount including fees
- **Transparent breakdown** shown in dashboard

## 🌟 Unique Features

### Programmable Commerce
- **One-click payment templates** (Coffee $5, Lunch $15, Consulting $100/hr)
- **Automated recurring billing** with email delivery
- **Group payment splitting** with automatic calculation
- **Social sharing** for viral payment link distribution

### Professional Experience
- **Success animations** with confetti and sound effects
- **Dark mode support** for accessibility
- **Real-time price conversion** using CoinGecko API
- **Mobile-first design** with QR code scanning

## 📈 Business Impact

### vs Traditional Payment Processors
- **Instant settlement** vs 2-3 day delays
- **Global accessibility** vs geographic restrictions
- **Lower fees** vs 2.9% + $0.30 (same rate, better service)
- **No chargebacks** vs fraud risk
- **Crypto-native** vs legacy infrastructure

### Revenue Model
- **Platform fees** from transaction processing
- **Premium features** for enterprise merchants
- **API access** for third-party integrations
- **White-label solutions** for other platforms

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Web3Auth integration
- ✅ Solana Pay processing
- ✅ Email invoicing
- ✅ Real-time analytics
- ✅ Currency conversion

### Phase 2 (Next 30 days)
- 🔄 Cross-chain support (Ethereum, Polygon)
- 🔄 Mobile app with push notifications
- 🔄 Advanced analytics dashboard
- 🔄 API for third-party integrations

### Phase 3 (Next 90 days)
- 🔄 AI-powered fraud detection
- 🔄 Multi-signature business accounts
- 🔄 Fiat on/off ramps
- 🔄 Enterprise features

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [https://afripay-demo.vercel.app](https://afripay-demo.vercel.app)
- **Documentation**: [Coming Soon]
- **API Reference**: [Coming Soon]
- **Support**: [Create an Issue](https://github.com/vybzcody/afri-pay-hub/issues)

## 🏆 Built for MetaMask Embedded Wallets Hackathon

**Track**: Programmable Commerce & DeFi for Everyone

AfriPay demonstrates how Web3Auth and Solana can make cryptocurrency payments as easy as traditional online payments, while maintaining the benefits of decentralization, transparency, and global accessibility.

---

**Made with ❤️ for the future of payments**
