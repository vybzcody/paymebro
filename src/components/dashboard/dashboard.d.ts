interface User {
    first_name?: string;
    web3auth_user_id: string;
}
interface DashboardProps {
    user: User;
    onCreatePayment: () => void;
    onViewTemplates: () => void;
    onViewWallets?: () => void;
}
export declare function Dashboard({ user, onCreatePayment, onViewTemplates, onViewWallets }: DashboardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=dashboard.d.ts.map