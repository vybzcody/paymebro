import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface CCTPTimerProps {
  startTime?: Date;
  estimatedDuration?: number; // in seconds
}

export const CCTPTimer = ({ startTime = new Date(), estimatedDuration = 300 }: CCTPTimerProps) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsed(elapsedSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = Math.min((elapsed / estimatedDuration) * 100, 100);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">Transfer Progress</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Elapsed: {formatTime(elapsed)}</span>
            <span>Est: {formatTime(estimatedDuration)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
