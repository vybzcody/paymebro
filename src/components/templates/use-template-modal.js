import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Loader2, QrCode, Copy, Check } from "lucide-react";
export function UseTemplateModal({ template, isOpen, onClose, onSubmit }) {
    const [customerEmail, setCustomerEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [paymentResult, setPaymentResult] = useState(null);
    const [copied, setCopied] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await onSubmit(customerEmail || undefined);
            setPaymentResult(result);
        }
        catch (error) {
            console.error('Failed to create payment from template:', error);
            alert(`Failed to create payment: ${error.message || 'Please try again.'}`);
        }
        finally {
            setIsLoading(false);
        }
    };
    const copyPaymentUrl = async () => {
        if (paymentResult?.paymentUrl) {
            await navigator.clipboard.writeText(paymentResult.paymentUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    const handleClose = () => {
        setCustomerEmail("");
        setPaymentResult(null);
        setCopied(false);
        onClose();
    };
    if (paymentResult) {
        return (_jsx(Dialog, { open: isOpen, onOpenChange: handleClose, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(QrCode, { className: "h-5 w-5 text-green-600" }), "Payment Created from Template"] }), _jsx(DialogDescription, { children: "Share this QR code or payment link with your customer" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("h3", { className: "font-medium text-sm text-gray-700", children: "Template Used" }), _jsx("p", { className: "text-lg font-semibold", children: template.name }), _jsxs("p", { className: "text-sm text-gray-600", children: [template.amount, " ", template.currency] })] }), _jsx("div", { className: "flex justify-center p-4 bg-gray-50 rounded-lg", children: _jsx("img", { src: paymentResult.qrCode, alt: "Payment QR Code", className: "w-48 h-48" }) }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Payment Link" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Input, { value: paymentResult.paymentUrl, readOnly: true, className: "text-sm" }), _jsx(Button, { variant: "outline", size: "sm", onClick: copyPaymentUrl, children: copied ? (_jsx(Check, { className: "h-4 w-4 text-green-600" })) : (_jsx(Copy, { className: "h-4 w-4" })) })] })] })] }), _jsx(DialogFooter, { children: _jsx(Button, { onClick: handleClose, className: "w-full", children: "Create Another Payment" }) })] }) }));
    }
    return (_jsx(Dialog, { open: isOpen, onOpenChange: handleClose, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { children: ["Use Template: ", template.name] }), _jsx(DialogDescription, { children: "Create a payment using this template" })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "bg-gray-50 p-4 rounded-lg", children: _jsx("div", { className: "flex justify-between items-start", children: _jsxs("div", { children: [_jsx("h3", { className: "font-medium", children: template.label }), _jsxs("p", { className: "text-2xl font-bold text-green-600 mt-1", children: [template.amount, " ", template.currency] }), template.message && (_jsx("p", { className: "text-sm text-gray-600 mt-2", children: template.message }))] }) }) }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "customerEmail", children: "Customer Email (Optional)" }), _jsx(Input, { id: "customerEmail", type: "email", placeholder: "customer@example.com", value: customerEmail, onChange: (e) => setCustomerEmail(e.target.value) })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: handleClose, children: "Cancel" }), _jsxs(Button, { type: "submit", disabled: isLoading, children: [isLoading && _jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Create Payment"] })] })] })] })] }) }));
}
