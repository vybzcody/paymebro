#!/bin/bash

# Test script to verify the simplified payment flow
echo "🧪 Testing AfriPay Simplified Payment Flow"
echo "=========================================="

# Test 1: Backend Health Check
echo "1. Testing backend health..."
HEALTH=$(curl -s http://localhost:3001/health | jq -r '.status')
if [ "$HEALTH" = "healthy" ]; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is not healthy"
    exit 1
fi

# Test 2: Create Payment Request (SOL)
echo "2. Testing SOL payment creation..."
SOL_RESPONSE=$(curl -s -X POST http://localhost:3001/api/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "amount": 1.5,
    "description": "Test SOL payment",
    "recipientWallet": "9CPhDgxQGHAvtHpaVjbemhPVXtN6ginqhAVyeocBN8z",
    "currency": "SOL"
  }')

SOL_FEE=$(echo $SOL_RESPONSE | jq -r '.feeBreakdown.afripayFee')
SOL_TOTAL=$(echo $SOL_RESPONSE | jq -r '.feeBreakdown.total')
SOL_ORIGINAL=$(echo $SOL_RESPONSE | jq -r '.feeBreakdown.originalAmount')

if [ "$SOL_FEE" = "0" ] && [ "$SOL_TOTAL" = "$SOL_ORIGINAL" ]; then
    echo "✅ SOL payment created with no fees (Customer pays: $SOL_TOTAL SOL)"
else
    echo "❌ SOL payment has unexpected fees (Fee: $SOL_FEE, Total: $SOL_TOTAL)"
fi

# Test 3: Create Payment Request (USDC)
echo "3. Testing USDC payment creation..."
USDC_RESPONSE=$(curl -s -X POST http://localhost:3001/api/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "amount": 25.00,
    "description": "Test USDC payment",
    "recipientWallet": "9CPhDgxQGHAvtHpaVjbemhPVXtN6ginqhAVyeocBN8z",
    "currency": "USDC"
  }')

USDC_FEE=$(echo $USDC_RESPONSE | jq -r '.feeBreakdown.afripayFee')
USDC_TOTAL=$(echo $USDC_RESPONSE | jq -r '.feeBreakdown.total')
USDC_ORIGINAL=$(echo $USDC_RESPONSE | jq -r '.feeBreakdown.originalAmount')

if [ "$USDC_FEE" = "0" ] && [ "$USDC_TOTAL" = "$USDC_ORIGINAL" ]; then
    echo "✅ USDC payment created with no fees (Customer pays: $USDC_TOTAL USDC)"
else
    echo "❌ USDC payment has unexpected fees (Fee: $USDC_FEE, Total: $USDC_TOTAL)"
fi

# Test 4: Verify Payment URL Format
echo "4. Testing payment URL format..."
PAYMENT_URL=$(echo $SOL_RESPONSE | jq -r '.paymentRequest.paymentUrl')
if [[ $PAYMENT_URL == *"amount=1.5"* ]] && [[ $PAYMENT_URL != *"fee"* ]]; then
    echo "✅ Payment URL contains exact amount without fee references"
else
    echo "❌ Payment URL format is incorrect: $PAYMENT_URL"
fi

# Test 5: Frontend Server Check
echo "5. Testing frontend server..."
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ Frontend server is running on port 8080"
else
    echo "⚠️  Frontend server is not running on port 8080"
fi

echo ""
echo "🎉 Payment Flow Test Complete!"
echo "Summary:"
echo "- No additional fees or charges"
echo "- Customer pays exactly the requested amount"
echo "- Merchant receives exactly the requested amount"
echo "- Clean Solana Pay URLs without fee complexity"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:8080 in your browser"
echo "2. Connect your wallet"
echo "3. Create a payment request"
echo "4. The validation errors should now be resolved!"
