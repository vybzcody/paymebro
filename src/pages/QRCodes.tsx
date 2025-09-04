import { MultiChainQRGenerator } from "@/components/MultiChainQRGenerator";
import QRCodeDebug from "@/components/QRCodeDebug";

export default function QRCodes() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Multi-Chain QR Code Generator</h1>
          <p className="text-gray-600 text-lg">Create payment QR codes for Solana and EVM chains with advanced CCTP support</p>
        </div>

        <QRCodeDebug />
        
        <MultiChainQRGenerator />
      </div>
    </div>
  );
}
