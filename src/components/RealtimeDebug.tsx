import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

export const RealtimeDebug = () => {
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<string>('Never');
  const [eventCount, setEventCount] = useState(0);
  const [subscription, setSubscription] = useState<any>(null);

  const setupDebugSubscription = () => {
    if (!user?.userId && !user?.id?.match(/^[0-9a-f-]{36}$/i)) return;

    const userId = user.userId || user.id;
    console.log('🐛 Setting up debug subscription for user:', userId);

    const sub = supabase
      .channel(`debug-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('🐛 Debug: Received real-time event:', payload);
          setLastUpdate(new Date().toLocaleTimeString());
          setEventCount(prev => prev + 1);
        }
      )
      .subscribe((status) => {
        console.log('🐛 Debug subscription status:', status);
        setConnectionStatus(status);
      });

    setSubscription(sub);
  };

  const cleanup = () => {
    if (subscription) {
      subscription.unsubscribe();
      setSubscription(null);
      setConnectionStatus('disconnected');
    }
  };

  useEffect(() => {
    setupDebugSubscription();
    return cleanup;
  }, [user?.userId, user?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBSCRIBED':
        return 'bg-green-100 text-green-800';
      case 'CHANNEL_ERROR':
        return 'bg-red-100 text-red-800';
      case 'TIMED_OUT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center">
          {connectionStatus === 'SUBSCRIBED' ? (
            <Wifi className="h-4 w-4 mr-2 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 mr-2 text-red-500" />
          )}
          Real-time Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Status:</span>
          <Badge className={getStatusColor(connectionStatus)}>
            {connectionStatus}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Events:</span>
          <span className="font-mono text-sm">{eventCount}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Last Update:</span>
          <span className="font-mono text-xs">{lastUpdate}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">User ID:</span>
          <span className="font-mono text-xs">
            {(user?.userId || user?.id)?.slice(0, 8)}...
          </span>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            cleanup();
            setupDebugSubscription();
          }}
          className="w-full"
        >
          <RefreshCw className="h-3 w-3 mr-2" />
          Reconnect
        </Button>
      </CardContent>
    </Card>
  );
};
