import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ExternalLink, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

interface NetworkInfo {
  network: string;
  connected: boolean;
  currentSlot?: number;
  connectionError?: string;
}

export const NetworkStatus: React.FC = () => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNetworkInfo = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/network');
        const data = await response.json();
        setNetworkInfo(data);
      } catch (error) {
        console.error('Failed to fetch network info:', error);
        setNetworkInfo({
          network: 'unknown',
          connected: false,
          connectionError: 'Failed to connect to backend'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkInfo();
    
    // Refresh network info every 30 seconds
    const interval = setInterval(fetchNetworkInfo, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        Checking network...
      </div>
    );
  }

  if (!networkInfo) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <WifiOff className="w-3 h-3" />
        Network Error
      </Badge>
    );
  }

  const isDevnet = networkInfo.network === 'devnet';
  const isConnected = networkInfo.connected;

  return (
    <div className="space-y-2">
      {/* Network Badge */}
      <div className="flex items-center gap-2">
        <Badge 
          variant={isDevnet ? "secondary" : "default"}
          className="flex items-center gap-1"
        >
          {isConnected ? (
            <Wifi className="w-3 h-3 text-green-500" />
          ) : (
            <WifiOff className="w-3 h-3 text-red-500" />
          )}
          {networkInfo.network.toUpperCase()}
          {networkInfo.currentSlot && (
            <span className="text-xs opacity-70">
              #{networkInfo.currentSlot}
            </span>
          )}
        </Badge>
        
        {isDevnet && (
          <Badge variant="outline" className="text-xs">
            Test Network
          </Badge>
        )}
      </div>

      {/* Devnet Warning */}
      {isDevnet && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm">
            <div className="space-y-2">
              <p className="font-medium text-amber-800">
                Running on Solana Devnet (Test Network)
              </p>
              <p className="text-amber-700">
                Mobile wallets need to be switched to devnet mode. 
                Get free devnet SOL for testing.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
                  onClick={() => window.open('https://faucet.solana.com', '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Get Devnet SOL
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
                  onClick={() => window.open('/MOBILE_WALLET_GUIDE.md', '_blank')}
                >
                  Wallet Setup Guide
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Error */}
      {!isConnected && networkInfo.connectionError && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Connection Error:</strong> {networkInfo.connectionError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default NetworkStatus;
