import { appConfig, getApiHeaders } from '@/lib/config';
export const paymentsApi = {
    async createPayment(paymentData) {
        console.log('🚀 Creating payment with data:', {
            ...paymentData,
            customerEmail: paymentData.customerEmail || 'none'
        });
        const requestBody = {
            ...paymentData,
            chain: paymentData.chain || 'solana',
            // Only include splToken if currency is USDC
            ...(paymentData.splToken && {
                splToken: paymentData.splToken
            }),
            // Include optional fields if provided
            ...(paymentData.customerEmail && paymentData.customerEmail.trim() && {
                customerEmail: paymentData.customerEmail.trim()
            }),
            ...(paymentData.memo && {
                memo: paymentData.memo
            }),
            ...(paymentData.merchantWallet && {
                merchantWallet: paymentData.merchantWallet
            })
        };
        console.log('📤 Request body:', requestBody);
        const response = await fetch(`${appConfig.apiUrl}${appConfig.endpoints.payments}/create`, {
            method: 'POST',
            headers: getApiHeaders(paymentData.web3AuthUserId),
            body: JSON.stringify(requestBody),
        });
        console.log('📥 Response status:', response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Payment creation failed:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText
            });
            throw new Error(`HTTP ${response.status}: Failed to create payment`);
        }
        const result = await response.json();
        console.log('✅ Payment created successfully:', result);
        if (!result.success) {
            console.error('❌ Backend returned error:', result.error);
            throw new Error(result.error || 'Failed to create payment');
        }
        return result;
    },
    async getPayment(reference) {
        console.log('🔍 Getting payment details for:', reference);
        const response = await fetch(`${appConfig.apiUrl}${appConfig.endpoints.payments}/${reference}`, {
            headers: getApiHeaders()
        });
        if (!response.ok) {
            console.error('❌ Failed to get payment:', response.status);
            throw new Error(`HTTP ${response.status}: Failed to get payment`);
        }
        const result = await response.json();
        console.log('📊 Payment details:', result);
        if (!result.success) {
            throw new Error(result.error || 'Failed to get payment');
        }
        return result.payment;
    },
    async getPaymentStatus(reference) {
        console.log('🔍 Getting payment status for:', reference);
        const response = await fetch(`${appConfig.apiUrl}${appConfig.endpoints.payments}/${reference}/status`, {
            headers: getApiHeaders()
        });
        if (!response.ok) {
            console.error('❌ Failed to get payment status:', response.status);
            throw new Error(`HTTP ${response.status}: Failed to get payment status`);
        }
        const result = await response.json();
        console.log('📊 Payment status:', result);
        if (!result.success) {
            throw new Error(result.error || 'Failed to get payment status');
        }
        return {
            reference: result.reference,
            status: result.status,
            amount: 0, // Will be filled from payment details if needed
            timestamp: new Date().toISOString(),
            signature: result.transaction_signature
        };
    },
    async getQRCode(reference) {
        console.log('🔍 Getting QR code for:', reference);
        const response = await fetch(`${appConfig.apiUrl}${appConfig.endpoints.payments}/${reference}/qr`, {
            headers: getApiHeaders()
        });
        if (!response.ok) {
            console.error('❌ Failed to get QR code:', response.status);
            throw new Error(`HTTP ${response.status}: Failed to get QR code`);
        }
        const result = await response.json();
        console.log('📊 QR code result:', result);
        if (!result.success) {
            throw new Error(result.error || 'Failed to get QR code');
        }
        return { qrCode: result.qrCode };
    },
    async getPaymentHistory(userId, page = 1, limit = 10) {
        console.log('🔍 Getting payment history for user:', userId);
        const response = await fetch(`${appConfig.apiUrl}/api/analytics/history?page=${page}&limit=${limit}`, {
            headers: getApiHeaders(userId),
        });
        if (!response.ok) {
            console.error('❌ Failed to get payment history:', response.status);
            throw new Error(`HTTP ${response.status}: Failed to get payment history`);
        }
        const result = await response.json();
        console.log('📊 Payment history:', result);
        if (!result.success) {
            throw new Error(result.error || 'Failed to get payment history');
        }
        // Filter payments by user ID
        const allPayments = result.payments || [];
        const userPayments = allPayments.filter((payment) => payment.web3auth_user_id === userId);
        return {
            payments: userPayments,
            totalPages: Math.ceil(userPayments.length / limit)
        };
    },
    async confirmPayment(signature, reference) {
        console.log('✅ Confirming payment:', { signature, reference });
        const response = await fetch(`${appConfig.apiUrl}${appConfig.endpoints.payments}/confirm`, {
            method: 'POST',
            headers: getApiHeaders(),
            body: JSON.stringify({ signature, reference }),
        });
        if (!response.ok) {
            console.error('❌ Failed to confirm payment:', response.status);
            throw new Error(`HTTP ${response.status}: Failed to confirm payment`);
        }
        const result = await response.json();
        console.log('✅ Payment confirmation result:', result);
        return result.success;
    },
};
