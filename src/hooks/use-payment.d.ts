export declare const usePayment: (userId?: string) => {
    createPayment: import("@tanstack/react-query").UseMutateFunction<import("@/lib/api/payments").PaymentResponse, Error, Omit<InsertPayment, "web3auth_user_id">, unknown>;
    createPaymentAsync: import("@tanstack/react-query").UseMutateAsyncFunction<import("@/lib/api/payments").PaymentResponse, Error, Omit<InsertPayment, "web3auth_user_id">, unknown>;
    isCreatingPayment: boolean;
    createPaymentError: Error;
    getPaymentStatus: (reference: string) => Promise<import("@/lib/api/payments").PaymentStatus>;
    getUserPayments: import("@tanstack/react-query").UseQueryResult<any, Error>;
    loading: boolean;
};
//# sourceMappingURL=use-payment.d.ts.map