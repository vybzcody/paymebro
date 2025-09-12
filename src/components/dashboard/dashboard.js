import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricsCards } from "./metrics-cards";
import { PaymentTrendsChart } from "../../pages/payment-trends-chart";
import { RecentPayments } from "./recent-payments";
import { QuickActions } from "./quick-actions";
import { Button } from "@/components/ui/button";
import { Plus, LayoutTemplate, Wallet } from "lucide-react";
import { useRef } from "react";
export function Dashboard({ user, onCreatePayment, onViewTemplates, onViewWallets, onViewAnalytics, onPaymentCreated }) {
    const recentPaymentsRef = useRef(null);
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center lg:justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold text-foreground", children: ["Welcome back, ", _jsx("span", { children: user.first_name || "User" }), "!"] }), _jsx("p", { className: "mt-1 text-muted-foreground", children: "Here's what's happening with your payments today." })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0", children: [_jsxs(Button, { onClick: onCreatePayment, className: "flex items-center gap-2", children: [_jsx(Plus, { className: "h-4 w-4" }), "Create Payment"] }), _jsxs(Button, { onClick: onViewTemplates, variant: "outline", className: "flex items-center gap-2", children: [_jsx(LayoutTemplate, { className: "h-4 w-4" }), "Templates"] }), onViewWallets && (_jsxs(Button, { onClick: onViewWallets, variant: "outline", className: "flex items-center gap-2", children: [_jsx(Wallet, { className: "h-4 w-4" }), "Wallets"] }))] })] }), _jsx(MetricsCards, { userId: user.web3auth_user_id }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [_jsx(PaymentTrendsChart, { userId: user.web3auth_user_id }), _jsx(RecentPayments, { ref: recentPaymentsRef, userId: user.web3auth_user_id })] }), _jsx(QuickActions, { onCreatePayment: onCreatePayment, onCreateTemplate: onViewTemplates, onViewAnalytics: onViewAnalytics || (() => { }) })] }));
}
