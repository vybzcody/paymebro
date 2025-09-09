interface QRReceiptModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    qrCode: {
        title: string;
        amount: number;
        currency: string;
        qr_code_url: string;
        payment_url: string;
        reference: string;
        payment_count: number;
        total_collected: number;
    } | null;
}
export declare function QRReceiptModal({ open, onOpenChange, qrCode }: QRReceiptModalProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=qr-receipt-modal.d.ts.map