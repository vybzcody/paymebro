interface Wallet {
    id: string;
    name: string;
    address: string;
    balance: string;
    currency: string;
    usdValue: string;
    network: string;
    type: 'primary' | 'secondary';
}
interface WithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    wallets: Wallet[];
}
export declare function WithdrawModal({ isOpen, onClose, wallets }: WithdrawModalProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=withdraw-modal.d.ts.map