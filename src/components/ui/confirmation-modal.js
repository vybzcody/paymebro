import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
export function ConfirmationModal({ open, onOpenChange, title, description, confirmText = "Confirm", cancelText = "Cancel", onConfirm, variant = "default" }) {
    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsx(DialogHeader, { children: _jsxs("div", { className: "flex items-center space-x-2", children: [variant === "destructive" && (_jsx(AlertTriangle, { className: "h-5 w-5 text-red-500" })), _jsx(DialogTitle, { children: title })] }) }), _jsx("p", { className: "text-sm text-gray-600", children: description }), _jsxs(DialogFooter, { className: "flex space-x-2", children: [_jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: cancelText }), _jsx(Button, { variant: variant === "destructive" ? "destructive" : "default", onClick: handleConfirm, children: confirmText })] })] }) }));
}
