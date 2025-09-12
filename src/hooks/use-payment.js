import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appConfig } from '@/lib/config';
import { paymentsApi } from '@/lib/api/payments';
export const usePayment = (userId) => {
    const queryClient = useQueryClient();
    const createPaymentMutation = useMutation({
        mutationFn: async (data) => {
            if (!userId)
                throw new Error('User ID required');
            return await paymentsApi.createPayment({
                amount: parseFloat(data.amount),
                label: data.label || 'Payment',
                message: data.message,
                customerEmail: data.customer_email || undefined,
                web3AuthUserId: userId,
                chain: 'solana',
                splToken: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr' // USDC devnet
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/payments/user', userId] });
            queryClient.invalidateQueries({ queryKey: ['/api/analytics/metrics', userId] });
        },
    });
    const getPaymentStatus = async (reference) => {
        return await paymentsApi.getPaymentStatus(reference);
    };
    const getUserPayments = useQuery({
        queryKey: ['/api/payments/user', userId],
        queryFn: async () => {
            if (!userId)
                throw new Error('User ID required');
            const response = await fetch(`${appConfig.apiUrl}/api/analytics/history`, {
                headers: {
                    'x-user-id': userId,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error);
            }
            return result;
        },
        enabled: !!userId,
    });
    return {
        createPayment: createPaymentMutation.mutate,
        createPaymentAsync: createPaymentMutation.mutateAsync,
        isCreatingPayment: createPaymentMutation.isPending,
        createPaymentError: createPaymentMutation.error,
        getPaymentStatus,
        getUserPayments,
        loading: createPaymentMutation.isPending,
    };
};
