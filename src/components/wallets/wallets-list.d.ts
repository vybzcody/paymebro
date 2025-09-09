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
interface WalletsListProps {
    wallets: Wallet[];
    isLoading: boolean;
    onWithdraw: () => void;
}
export declare function WalletsList({ wallets, isLoading, onWithdraw }: WalletsListProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=wallets-list.d.ts.map