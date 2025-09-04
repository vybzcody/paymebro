import React from 'react';
import { CCTPCrossChainPayment } from '@/components/CCTPCrossChainPayment';
import { CCTPTransactionTracker } from '@/components/CCTPTransactionTracker';

export const CCTPBridge: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🌉 CCTP Cross-Chain Bridge</h1>
        <p className="text-gray-600">
          Transfer USDC seamlessly across Ethereum, Solana, and other supported chains using Circle's CCTP protocol.
        </p>
      </div>

      <div className="grid lg:grid-cols-1 gap-8 max-w-4xl mx-auto">
        <div>
          <h2 className="text-xl font-semibold mb-4">Transfer USDC Cross-Chain</h2>
          <CCTPCrossChainPayment />
        </div>
      </div>

      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 max-w-4xl mx-auto">
        <h3 className="text-lg font-semibold mb-4">🏆 CCTP v2 Features</h3>
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-medium text-blue-600 mb-2">🔥 Native CCTP Integration</h4>
            <p className="text-gray-600">Direct integration with Circle's Cross-Chain Transfer Protocol v2</p>
            <ul className="mt-2 text-xs text-gray-500 space-y-1">
              <li>• Real-time burn transactions</li>
              <li>• Automatic attestation polling</li>
              <li>• Seamless mint execution</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-medium text-purple-600 mb-2">⚡ Multi-Chain Support</h4>
            <p className="text-gray-600">Ethereum ↔ Solana transfers with 6 chain support</p>
            <ul className="mt-2 text-xs text-gray-500 space-y-1">
              <li>• Ethereum, Arbitrum, Base</li>
              <li>• Polygon, Avalanche</li>
              <li>• Solana (SPL Token)</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-medium text-green-600 mb-2">📊 Real-Time Tracking</h4>
            <p className="text-gray-600">Live transaction status and attestation monitoring</p>
            <ul className="mt-2 text-xs text-gray-500 space-y-1">
              <li>• Step-by-step progress</li>
              <li>• Timer with countdown</li>
              <li>• Detailed transaction logs</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">🚧 Demo Mode</h4>
          <p className="text-yellow-700 text-sm">
            This is a demonstration of CCTP v2 functionality. In production, this would connect to actual 
            Circle CCTP contracts and handle real USDC transfers across chains.
          </p>
        </div>
      </div>
    </div>
  );
};
