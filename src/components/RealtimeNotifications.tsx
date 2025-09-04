import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useMultiChainWeb3Auth } from '@/contexts/MultiChainWeb3AuthContext';
import { toast } from 'sonner';
import { DollarSign, Zap } from 'lucide-react';

export const RealtimeNotifications = () => {
  const { user } = useMultiChainWeb3Auth();

  useEffect(() => {
    if (!user?.userId && !user?.id?.match(/^[0-9a-f-]{36}$/i)) return;

    const userId = user.userId || user.id;
    
    // Set up real-time subscription for notifications
    const subscription = supabase
      .channel('payment-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const transaction = payload.new as any;
          
          // Show success notification with custom styling
          toast.success(
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Payment Received!</p>
                <p className="text-sm text-gray-600">
                  {transaction.amount} {transaction.currency}
                </p>
              </div>
            </div>,
            {
              duration: 5000,
              position: 'top-right',
            }
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const transaction = payload.new as any;
          
          if (transaction.status === 'confirmed') {
            toast.success(
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Payment Confirmed</p>
                  <p className="text-sm text-gray-600">
                    {transaction.amount} {transaction.currency}
                  </p>
                </div>
              </div>,
              {
                duration: 3000,
                position: 'top-right',
              }
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.userId, user?.id]);

  return null; // This component doesn't render anything
};

export default RealtimeNotifications;
