import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleCCTPWidget } from './SimpleCCTPWidget';
import { ArrowRightLeft } from 'lucide-react';

export const CCTPDashboardWidget: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            Cross-Chain USDC Transfers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <SimpleCCTPWidget />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
