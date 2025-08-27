# Mobile Wallet Troubleshooting Guide

## Issue: "Something wrong while sending" in Phantom Mobile App

When you scan the QR code and Phantom shows "something wrong while sending", this is typically due to **devnet configuration issues**.

## ✅ **Root Cause**

The error occurs because:
1. **Wallet not on devnet**: Your Phantom wallet is connected to mainnet, but AfriPay is running on devnet
2. **No devnet SOL**: Your wallet doesn't have SOL on devnet for transaction fees
3. **Account not found**: The wallet address doesn't exist on devnet

## 🔧 **Solution Steps**

### Step 1: Switch Phantom to Devnet

**On Phantom Mobile App:**
1. Open Phantom app
2. Tap the hamburger menu (☰) in top left
3. Tap "Settings" 
4. Tap "Developer Settings"
5. Toggle "Testnet Mode" ON
6. Select "Devnet" from the network dropdown
7. Your wallet address will change (this is normal)

**On Phantom Browser Extension:**
1. Click the settings gear icon
2. Click "Developer Settings"
3. Toggle "Testnet Mode" ON
4. Select "Devnet"

### Step 2: Get Devnet SOL

Your wallet needs SOL on devnet for transaction fees:

1. **Copy your devnet wallet address** (it's different from mainnet)
2. **Visit Solana Faucet**: https://faucet.solana.com
3. **Paste your devnet address**
4. **Request 2 SOL** (maximum per request)
5. **Wait 30-60 seconds** for the SOL to arrive

### Step 3: Verify Setup

1. **Check balance**: Your Phantom should show ~2 SOL
2. **Network indicator**: Should show "Devnet" in Phantom
3. **Try payment**: Scan the QR code again

## 🧪 **Test Your Setup**

Use this test wallet address that has devnet SOL:
```
Test Address: 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
```

If this address works but yours doesn't, you need more devnet SOL.

## 🚨 **Common Issues**

### "Wallet Not Found" Error
- **Cause**: Wallet has no devnet SOL
- **Solution**: Get SOL from faucet

### "Insufficient Balance" Error  
- **Cause**: Not enough SOL for fees
- **Solution**: Get more SOL from faucet

### "Invalid Network" Error
- **Cause**: Wallet on mainnet, app on devnet
- **Solution**: Switch wallet to devnet

### QR Code Scans But Nothing Happens
- **Cause**: Phantom not recognizing Solana Pay URL
- **Solution**: Update Phantom app, ensure devnet mode

## 📱 **Mobile Wallet Specific Tips**

### Phantom Mobile
- Ensure app is updated to latest version
- Clear app cache if issues persist
- Try force-closing and reopening app

### Other Wallets (Solflare, etc.)
- Most mobile wallets support Solana Pay
- Same devnet setup process applies
- Some wallets call it "Testnet" instead of "Devnet"

## 🔍 **Debug Information**

When testing, the backend provides detailed error messages:

```json
{
  "error": "Wallet Not Found",
  "message": "Your wallet was not found on Solana devnet. Please ensure your wallet is connected to devnet.",
  "details": {
    "network": "devnet",
    "suggestion": "Switch to devnet in your wallet settings and get SOL from https://faucet.solana.com"
  }
}
```

## ✅ **Success Indicators**

When everything works correctly:
- Phantom shows transaction details
- Amount displays correctly (no extra fees)
- Transaction completes successfully
- Payment status updates in AfriPay

## 🆘 **Still Having Issues?**

### Option 1: Use Browser Extension
- Use Phantom browser extension instead of mobile
- Easier to switch networks and debug

### Option 2: Switch to Mainnet (Advanced)
- Update `.env` file: `SOLANA_NETWORK=mainnet-beta`
- Use real SOL (costs money)
- Only for production use

### Option 3: Use Different Wallet
- Try Solflare mobile app
- Try Backpack wallet
- Some wallets handle devnet better

## 📋 **Quick Checklist**

Before scanning QR code:
- [ ] Phantom in devnet/testnet mode
- [ ] Wallet has 0.1+ SOL on devnet
- [ ] QR code generated successfully
- [ ] Backend server running
- [ ] Network connection stable

## 🎯 **Expected Flow**

1. **Generate QR**: AfriPay creates payment request
2. **Scan QR**: Phantom reads Solana Pay URL
3. **Show Details**: Phantom displays amount and recipient
4. **Confirm**: User approves transaction
5. **Submit**: Transaction sent to Solana devnet
6. **Complete**: Payment confirmed in AfriPay

The key is ensuring both AfriPay (backend) and Phantom (wallet) are using the same network (devnet).
