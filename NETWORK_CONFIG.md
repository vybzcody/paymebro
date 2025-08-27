# Network Configuration Guide

AfriPay follows the official Solana Pay example configuration and **runs on devnet by default**.

## 🌐 **Current Network: Devnet**

Our app is configured exactly like the [official Solana Pay point-of-sale example](https://github.com/solana-labs/solana-pay/tree/master/examples/point-of-sale):

- **Default Network**: Solana Devnet
- **RPC Endpoint**: `https://api.devnet.solana.com`
- **USDC Mint**: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU` (devnet USDC)

## 🔧 **Why Devnet?**

Following the official Solana Pay template:
1. **Safe Testing**: No real money at risk
2. **Free Transactions**: No actual SOL costs
3. **Development Standard**: Official examples use devnet
4. **Easy Debugging**: Better error messages and tooling

## 📱 **Mobile Wallet Setup (Required)**

Since we use devnet, mobile wallets need to be configured:

### Phantom Mobile
1. Open Phantom app
2. Tap hamburger menu (☰)
3. Go to Settings → Developer Settings
4. Toggle "Testnet Mode" ON
5. Select "Devnet"
6. Get devnet SOL from https://faucet.solana.com

### Other Wallets
- **Solflare**: Settings → Network → Devnet
- **Backpack**: Settings → Developer → Network → Devnet

## 🚀 **Switching to Mainnet (Production)**

To switch to mainnet for production use:

### Backend Configuration
```bash
# Update server/.env
SOLANA_NETWORK=mainnet-beta
RPC_ENDPOINT=https://api.mainnet-beta.solana.com
USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

### Frontend Configuration
```bash
# Update .env.local
VITE_SOLANA_NETWORK=mainnet-beta
VITE_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
```

### Important Mainnet Considerations
- **Real Money**: Transactions use actual SOL/USDC
- **Transaction Fees**: ~0.000005 SOL per transaction
- **Higher RPC Costs**: Consider using paid RPC providers
- **Security**: Implement proper key management

## 🧪 **Testing Your Network Setup**

Check your current network configuration:

```bash
# Check backend network
curl http://localhost:3001/api/network

# Check if wallet exists on current network
curl http://localhost:3001/api/network/check/YOUR_WALLET_ADDRESS
```

## 📋 **Network Compatibility Matrix**

| Component | Devnet | Mainnet |
|-----------|--------|---------|
| AfriPay Backend | ✅ Default | ✅ Configurable |
| Phantom Mobile | ✅ Testnet Mode | ✅ Default |
| Browser Wallets | ✅ Network Switch | ✅ Default |
| Transaction Fees | ✅ Free | 💰 ~$0.000025 |
| USDC | ✅ Test Tokens | 💰 Real USDC |

## 🔍 **Troubleshooting Network Issues**

### "Account Not Found" Error
- **Cause**: Wallet on wrong network
- **Solution**: Switch wallet to match backend network

### "Insufficient Balance" Error
- **Devnet**: Get SOL from https://faucet.solana.com
- **Mainnet**: Buy SOL from exchange

### QR Code Scans But Fails
- **Check**: Backend and wallet on same network
- **Verify**: Wallet has sufficient balance for fees

## 🎯 **Recommended Development Flow**

1. **Development**: Use devnet (current setup)
2. **Testing**: Use devnet with test wallets
3. **Staging**: Use devnet with production-like data
4. **Production**: Switch to mainnet with proper security

## 📚 **Official References**

- [Solana Pay Specification](https://docs.solanapay.com/)
- [Official Point-of-Sale Example](https://github.com/solana-labs/solana-pay/tree/master/examples/point-of-sale)
- [Solana Devnet Faucet](https://faucet.solana.com/)
- [Network Configuration Guide](https://docs.solana.com/clusters)

Our implementation follows the official Solana Pay standards and best practices!
