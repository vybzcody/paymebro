import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
export function CreateTemplateModal({ isOpen, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        name: "",
        amount: "",
        currency: "USDC",
        label: "",
        message: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSubmit(formData);
            setFormData({
                name: "",
                amount: "",
                currency: "USDC",
                label: "",
                message: "",
            });
        }
        catch (error) {
            console.error('Failed to create template:', error);
            alert(`Failed to create template: ${error.message || 'Please try again.'}`);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleClose = () => {
        setFormData({
            name: "",
            amount: "",
            currency: "USDC",
            label: "",
            message: "",
        });
        onClose();
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: handleClose, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Create Payment Template" }), _jsx(DialogDescription, { children: "Create a reusable template for faster payment generation" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "name", children: "Template Name" }), _jsx(Input, { id: "name", placeholder: "e.g., Coffee Shop Standard", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), required: true })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "amount", children: "Amount" }), _jsx(Input, { id: "amount", type: "number", step: "0.01", min: "0", placeholder: "0.00", value: formData.amount, onChange: (e) => setFormData({ ...formData, amount: e.target.value }), required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "currency", children: "Currency" }), _jsxs(Select, { value: formData.currency, onValueChange: (value) => setFormData({ ...formData, currency: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "USDC", children: "USDC" }), _jsx(SelectItem, { value: "SOL", children: "SOL" })] })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "label", children: "Payment Label" }), _jsx(Input, { id: "label", placeholder: "e.g., Coffee Purchase", value: formData.label, onChange: (e) => setFormData({ ...formData, label: e.target.value }), required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "message", children: "Message (Optional)" }), _jsx(Textarea, { id: "message", placeholder: "Thank you for your purchase!", value: formData.message, onChange: (e) => setFormData({ ...formData, message: e.target.value }), rows: 3 })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: handleClose, children: "Cancel" }), _jsxs(Button, { type: "submit", disabled: isLoading, children: [isLoading && _jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Create Template"] })] })] })] }) }));
}
