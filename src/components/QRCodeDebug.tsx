import React from 'react';
import { PublicKey } from '@solana/web3.js';
import { solanaPayService } from '@/services/solanaPayService';

export const QRCodeDebug: React.FC = () => {
  const debugPaymentGeneration = () => {
    console.log('🔍 QR CODE GENERATION DEBUG');
    console.log('===========================');
    
    // Check environment variables
    console.log('Environment Variables:');
    console.log('VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('VITE_SOLANA_NETWORK:', import.meta.env.VITE_SOLANA_NETWORK);
    
    // Test the actual payment generation
    try {
      const mockMerchantWallet = new PublicKey('EHwtMrGE6V5fH3xUKYcoHzbouUqfgB4jd7MsqfQfHVSn');
      const mockReference = solanaPayService.generateReference();
      
      const paymentResult = solanaPayService.createAfriPayPayment({
        merchantWallet: mockMerchantWallet,
        amount: 10,
        currency: 'USDC',
        description: 'Test Payment',
        merchantName: 'Test Merchant',
        reference: mockReference,
      });
      
      console.log('');
      console.log('📊 PAYMENT GENERATION RESULT:');
      console.log('Payment URL:', paymentResult.paymentUrl);
      console.log('QR Code URL:', paymentResult.qrCodeUrl);
      console.log('Reference:', paymentResult.reference.toString());
      
      // Check if URLs contain localhost
      if (paymentResult.paymentUrl.includes('localhost')) {
        console.log('❌ PROBLEM: Payment URL contains localhost!');
        console.log('   Mobile wallets cannot reach localhost URLs');
      } else {
        console.log('✅ GOOD: Payment URL uses production endpoint');
      }
      
      // Parse the payment URL to see the actual transaction endpoint
      try {
        // The payment URL is encoded, so we need to decode it first
        const cleanUrl = paymentResult.paymentUrl.replace('solana:', '');
        const decodedUrl = decodeURIComponent(cleanUrl);
        console.log('Decoded URL:', decodedUrl);
        
        const url = new URL(decodedUrl);
        const linkParam = url.searchParams.get('link');
        
        console.log('');
        console.log('🔗 TRANSACTION ENDPOINT ANALYSIS:');
        console.log('Decoded payment URL:', decodedUrl);
        
        if (linkParam) {
          console.log('Link parameter:', linkParam);
          
          if (linkParam.includes('localhost')) {
            console.log('❌ CRITICAL: Transaction endpoint uses localhost!');
            console.log('   This is why mobile scanning fails');
          } else {
            console.log('✅ GOOD: Transaction endpoint uses production URL');
          }
        } else {
          // Check if this is a direct transaction URL (not using link parameter)
          if (decodedUrl.includes('/api/solana-pay/transaction')) {
            console.log('📝 NOTE: Solana Pay Transaction Request URL detected');
            if (decodedUrl.includes('localhost')) {
              console.log('❌ CRITICAL: Transaction Request endpoint uses localhost!');
              console.log('   Mobile wallets cannot reach localhost');
            } else {
              console.log('✅ GOOD: Transaction Request endpoint uses production URL');
              console.log('   URL format: Direct transaction request');
            }
          } else {
            console.log('❌ No transaction endpoint found in payment URL');
          }
        }
      } catch (parseError) {
        console.log('⚠️  Could not parse payment URL:', parseError.message);
        console.log('Raw payment URL:', paymentResult.paymentUrl);
      }
      
    } catch (error) {
      console.error('❌ Payment generation failed:', error);
    }
  };

  return (
    <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 m-4">
      <h3 className="text-lg font-bold text-yellow-800 mb-2">🐛 QR Code Debug</h3>
      <p className="text-yellow-700 mb-3">
        Click to test QR code URL generation and check for localhost issues
      </p>
      <button
        onClick={debugPaymentGeneration}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-medium"
      >
        Run QR Code Debug Test
      </button>
      <p className="text-sm text-yellow-600 mt-2">
        Check browser console for detailed output
      </p>
    </div>
  );
};

export default QRCodeDebug;
