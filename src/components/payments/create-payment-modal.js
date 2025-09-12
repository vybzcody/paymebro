import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { paymentsApi } from "@/lib/api/payments";
import { Loader2, Copy, Check, ArrowLeft, Wifi, WifiOff, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/components/providers/websocket-provider";
export function CreatePaymentModal({ isOpen, onClose, userId }) {
    const [formData, setFormData] = useState({
        amount: "",
        label: "",
        message: "",
        currency: "USDC",
        customerEmail: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [paymentResult, setPaymentResult] = useState(null);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();
    const { joinPayment, isConnected, isConnecting, connectionError, reconnect } = useWebSocket();
    const isValidEmail = (email) => {
        if (!email.trim())
            return true; // Empty is valid (optional)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('🎯 Form submission started:', {
            ...formData
        });
        if (!formData.amount || !formData.label) {
            toast({
                title: "Validation Error",
                description: "Amount and label are required",
                variant: "destructive",
            });
            return;
        }
        setIsLoading(true);
        try {
            const splToken = formData.currency === 'USDC'
                ? 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr' // USDC devnet
                : undefined; // SOL (native)
            console.log('💰 Payment configuration:', {
                currency: formData.currency,
                splToken,
                chain: 'solana'
            });
            const paymentData = {
                amount: parseFloat(formData.amount),
                label: formData.label,
                message: formData.message || formData.label,
                customerEmail: formData.customerEmail || undefined,
                web3AuthUserId: userId,
                chain: 'solana',
                splToken
            };
            const result = await paymentsApi.createPayment(paymentData);
            console.log('🎉 Payment created successfully:', result);
            setPaymentResult(result);
            // Join the payment room for real-time updates
            if (result.reference) {
                try {
                    const joined = await joinPayment(result.reference);
                    if (joined) {
                        console.log('Successfully joined payment room for real-time updates');
                    }
                    else {
                        console.warn('Failed to join payment room for real-time updates');
                    }
                }
                catch (error) {
                    console.error('Error joining payment room:', error);
                    toast({
                        title: "Real-time Updates",
                        description: "Could not enable real-time payment updates",
                        variant: "destructive",
                    });
                }
            }
            toast({
                title: "Payment Created!",
                description: `${formData.currency} payment request created successfully`,
                action: (_jsx("div", { className: "flex flex-col gap-1", children: _jsx("span", { className: "text-xs text-muted-foreground", children: "Ensure payer has sufficient SOL for gas fees" }) })),
            });
        }
        catch (error) {
            console.error('💥 Payment creation failed:', error);
            toast({
                title: "Payment Creation Failed",
                description: error instanceof Error ? error.message : "Please try again",
                variant: "destructive",
            });
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
            toast({
                title: "Copied!",
                description: "Payment link copied to clipboard",
            });
        }
    };
    const handleClose = () => {
        setFormData({ amount: "", label: "", message: "", currency: "USDC", customerEmail: "" });
        setPaymentResult(null);
        setCopied(false);
        onClose();
    };
    const handleBackToForm = () => {
        setPaymentResult(null);
        setCopied(false);
    };
    // Success State
    if (paymentResult) {
        return (_jsx(Dialog, { open: isOpen, onOpenChange: handleClose, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center gap-2 text-green-600", children: [_jsx(Check, { className: "h-5 w-5" }), "Payment Created Successfully!"] }), _jsxs(DialogDescription, { children: ["Your ", formData.currency, " payment request is ready to share"] })] }), _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [isConnecting && (_jsxs("span", { className: "text-yellow-600 flex items-center gap-1", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-yellow-500 animate-pulse" }), "Connecting..."] })), !isConnecting && isConnected && (_jsxs("span", { className: "text-green-600 flex items-center gap-1", children: [_jsx(Wifi, { className: "h-3 w-3" }), "Real-time updates enabled"] })), !isConnecting && !isConnected && (_jsxs("span", { className: "text-red-600 flex items-center gap-1", children: [_jsx(WifiOff, { className: "h-3 w-3" }), "Real-time updates disabled"] }))] }), !isConnected && !isConnecting && (_jsxs(Button, { variant: "outline", size: "sm", onClick: reconnect, className: "h-6 text-xs", children: [_jsx(RotateCcw, { className: "h-3 w-3 mr-1" }), "Retry"] }))] }), connectionError && (_jsx("div", { className: "text-sm text-red-600 p-2 bg-red-50 rounded", children: connectionError })), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "text-center p-4 bg-green-50 rounded-lg border border-green-200", children: [_jsxs("div", { className: "text-2xl font-bold text-green-700", children: [formData.amount, " ", formData.currency] }), _jsx("div", { className: "text-sm text-green-600", children: formData.label }), _jsx("div", { className: "text-xs text-muted-foreground mt-2", children: "Payer needs sufficient SOL for gas fees" })] }), paymentResult.qrCode && (_jsxs("div", { className: "text-center", children: [_jsx("img", { src: paymentResult.qrCode, alt: "Payment QR Code", className: "w-48 h-48 mx-auto border rounded-lg" }), _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "Scan with Solana wallet" })] })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Payment Link" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Input, { value: paymentResult.paymentUrl, readOnly: true, className: "text-sm" }), _jsx(Button, { variant: "outline", size: "sm", onClick: copyPaymentUrl, children: copied ? (_jsx(Check, { className: "h-4 w-4 text-green-600" })) : (_jsx(Copy, { className: "h-4 w-4" })) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Reference ID" }), _jsx(Input, { value: paymentResult.reference, readOnly: true, className: "text-sm font-mono" })] })] }), _jsxs(DialogFooter, { className: "gap-2", children: [_jsxs(Button, { variant: "outline", onClick: handleBackToForm, className: "flex-1", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Create Another"] }), _jsx(Button, { onClick: handleClose, className: "flex-1", children: "Done" })] })] }) }));
    }
    // Form State
    return (_jsx(Dialog, { open: isOpen, onOpenChange: handleClose, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Create Payment Request" }), _jsx(DialogDescription, { children: "Generate a payment QR code for your customer" })] }), _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [isConnecting && (_jsxs("span", { className: "text-yellow-600 flex items-center gap-1", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-yellow-500 animate-pulse" }), "Connecting..."] })), !isConnecting && isConnected && (_jsxs("span", { className: "text-green-600 flex items-center gap-1", children: [_jsx(Wifi, { className: "h-3 w-3" }), "Real-time updates enabled"] })), !isConnecting && !isConnected && (_jsxs("span", { className: "text-red-600 flex items-center gap-1", children: [_jsx(WifiOff, { className: "h-3 w-3" }), "Real-time updates disabled"] }))] }), !isConnected && !isConnecting && (_jsxs(Button, { variant: "outline", size: "sm", onClick: reconnect, className: "h-6 text-xs", children: [_jsx(RotateCcw, { className: "h-3 w-3 mr-1" }), "Retry"] }))] }), connectionError && (_jsx("div", { className: "text-sm text-red-600 p-2 bg-red-50 rounded", children: connectionError })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "amount", children: "Amount *" }), _jsx(Input, { id: "amount", type: "number", step: "0.01", min: "0", placeholder: "0.00", value: formData.amount, onChange: (e) => setFormData({ ...formData, amount: e.target.value }), required: true, disabled: isLoading })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "currency", children: "Currency *" }), _jsxs(Select, { value: formData.currency, onValueChange: (value) => setFormData({ ...formData, currency: value }), disabled: isLoading, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "USDC", children: "USDC" }), _jsx(SelectItem, { value: "SOL", children: "SOL" })] })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "label", children: "Payment Label *" }), _jsx(Input, { id: "label", placeholder: "e.g., Coffee Purchase", value: formData.label, onChange: (e) => setFormData({ ...formData, label: e.target.value }), required: true, disabled: isLoading })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "message", children: "Message (Optional)" }), _jsx(Textarea, { id: "message", placeholder: "Thank you for your purchase!", value: formData.message, onChange: (e) => setFormData({ ...formData, message: e.target.value }), rows: 3, disabled: isLoading })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "customerEmail", children: "Customer Email (Optional)" }), _jsx(Input, { id: "customerEmail", type: "email", placeholder: "customer@example.com", value: formData.customerEmail, onChange: (e) => setFormData({ ...formData, customerEmail: e.target.value }), disabled: isLoading })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: handleClose, disabled: isLoading, children: "Cancel" }), _jsxs(Button, { type: "submit", disabled: isLoading, children: [isLoading && _jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), isLoading ? 'Creating...' : `Create ${formData.currency} Payment`] })] })] })] }) }));
}
