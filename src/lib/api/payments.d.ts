export interface CreatePaymentRequest {
    amount: number;
    label: string;
    message?: string;
    customerEmail?: string;
    web3AuthUserId: string;
    chain?: string;
    splToken?: string;
}
export interface PaymentResponse {
    success: boolean;
    reference: string;
    url: string;
    paymentUrl: string;
    qrCode: string;
}
export interface PaymentStatus {
    reference: string;
    status: 'pending' | 'confirmed' | 'failed';
    amount: number;
    signature?: string;
    timestamp: string;
}
export declare const paymentsApi: {
    createPayment(paymentData: CreatePaymentRequest): Promise<PaymentResponse>;
    getPaymentStatus(reference: string): Promise<PaymentStatus>;
    confirmPayment(signature: string, reference: string): Promise<boolean>;
};
//# sourceMappingURL=payments.d.ts.map