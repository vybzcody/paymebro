import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Clock } from "lucide-react";

interface TransactionSpeedCounterProps {
  isActive: boolean;
  onComplete?: () => void;
}

export const TransactionSpeedCounter = ({ isActive, onComplete }: TransactionSpeedCounterProps) => {
  const [time, setTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setTime(0);
      setIsCompleted(false);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setTime(elapsed);

      // Simulate Solana confirmation time (0.4s average)
      if (elapsed >= 0.4 && !isCompleted) {
        setIsCompleted(true);
        onComplete?.();
      }
    }, 10);

    return () => clearInterval(interval);
  }, [isActive, isCompleted, onComplete]);

  if (!isActive && !isCompleted) return null;

  return (
    <Card className="border-2 border-green-500 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-center space-x-3">
          {isCompleted ? (
            <>
              <Zap className="h-6 w-6 text-green-600" />
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  Payment Confirmed in {time.toFixed(2)}s
                </div>
                <div className="text-sm text-green-700">
                  ⚡ Powered by Solana's speed
                </div>
              </div>
            </>
          ) : (
            <>
              <Clock className="h-6 w-6 text-blue-600 animate-spin" />
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  Processing... {time.toFixed(2)}s
                </div>
                <div className="text-sm text-blue-700">
                  Solana network confirmation
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
