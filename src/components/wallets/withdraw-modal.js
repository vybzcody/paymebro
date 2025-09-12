import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
export function WithdrawModal({ isOpen, onClose, wallets }) {
    const [selectedWallet, setSelectedWallet] = useState("");
    const [amount, setAmount] = useState("");
    const [withdrawMethod, setWithdrawMethod] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        // This would integrate with actual withdrawal service
        alert("Withdrawal feature coming soon! This will integrate with fiat off-ramps.");
        onClose();
    };
    const handleClose = () => {
        setSelectedWallet("");
        setAmount("");
        setWithdrawMethod("");
        onClose();
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: handleClose, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Withdraw Funds" }), _jsx(DialogDescription, { children: "Convert your cryptocurrency to cash" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "wallet", children: "Select Wallet" }), _jsxs(Select, { value: selectedWallet, onValueChange: setSelectedWallet, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Choose wallet to withdraw from" }) }), _jsx(SelectContent, { children: wallets.map((wallet) => (_jsxs(SelectItem, { value: wallet.id, children: [wallet.name, " - ", wallet.balance, " ", wallet.currency] }, wallet.id))) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "amount", children: "Amount" }), _jsx(Input, { id: "amount", type: "number", step: "0.01", min: "0", placeholder: "0.00", value: amount, onChange: (e) => setAmount(e.target.value), required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "method", children: "Withdrawal Method" }), _jsxs(Select, { value: withdrawMethod, onValueChange: setWithdrawMethod, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select withdrawal method" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "bank", children: "Bank Transfer" }), _jsx(SelectItem, { value: "paypal", children: "PayPal" }), _jsx(SelectItem, { value: "card", children: "Debit Card" })] })] })] }), _jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(AlertCircle, { className: "h-5 w-5 text-yellow-600 mt-0.5" }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-yellow-800", children: "Feature Coming Soon" }), _jsx("p", { className: "text-sm text-yellow-700 mt-1", children: "Fiat withdrawals will be available soon. We're integrating with payment processors to provide seamless crypto-to-cash conversions." }), _jsx(Badge, { variant: "secondary", className: "mt-2", children: "Q1 2025" })] })] }) }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: handleClose, children: "Cancel" }), _jsx(Button, { type: "submit", children: "Preview Withdrawal" })] })] })] }) }));
}
