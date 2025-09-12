import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback } from "react";
import { Plus, Wallet, Star, Trash2, Edit, Copy, Check } from "lucide-react";
import { merchantAddressesApi } from "@/lib/api/merchant-addresses";
import { AddAddressModal } from "./add-address-modal";
import { EditAddressModal } from "./edit-address-modal";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
export function MerchantAddressManagement({ userId }) {
    const { toast } = useToast();
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [copiedAddress, setCopiedAddress] = useState(null);
    const fetchAddresses = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await merchantAddressesApi.getUserAddresses(userId);
            setAddresses(data);
        }
        catch (error) {
            console.error('Failed to fetch merchant addresses:', error);
            setError('Failed to load merchant addresses');
        }
        finally {
            setIsLoading(false);
        }
    }, [userId]);
    useEffect(() => {
        if (userId) {
            fetchAddresses();
        }
    }, [fetchAddresses]);
    const handleAddAddress = async (addressData) => {
        try {
            await merchantAddressesApi.addAddress(userId, addressData);
            await fetchAddresses();
            setIsAddModalOpen(false);
            toast({
                title: "Success",
                description: "Merchant address added successfully",
            });
        }
        catch (error) {
            console.error('Failed to add address:', error);
            toast({
                title: "Error",
                description: "Failed to add merchant address",
                variant: "destructive",
            });
            throw error;
        }
    };
    const handleEditAddress = async (addressId, updates) => {
        try {
            await merchantAddressesApi.updateAddress(userId, addressId, updates);
            await fetchAddresses();
            setEditingAddress(null);
            toast({
                title: "Success",
                description: "Merchant address updated successfully",
            });
        }
        catch (error) {
            console.error('Failed to update address:', error);
            toast({
                title: "Error",
                description: "Failed to update merchant address",
                variant: "destructive",
            });
            throw error;
        }
    };
    const handleDeleteAddress = async (addressId) => {
        if (!confirm('Are you sure you want to delete this address?'))
            return;
        try {
            await merchantAddressesApi.deleteAddress(userId, addressId);
            await fetchAddresses();
            toast({
                title: "Success",
                description: "Merchant address deleted successfully",
            });
        }
        catch (error) {
            console.error('Failed to delete address:', error);
            toast({
                title: "Error",
                description: "Failed to delete merchant address",
                variant: "destructive",
            });
        }
    };
    const handleSetDefault = async (addressId) => {
        try {
            await merchantAddressesApi.setDefaultAddress(userId, addressId);
            await fetchAddresses();
            toast({
                title: "Success",
                description: "Default address updated successfully",
            });
        }
        catch (error) {
            console.error('Failed to set default address:', error);
            toast({
                title: "Error",
                description: "Failed to set default address",
                variant: "destructive",
            });
        }
    };
    const handleCopyAddress = (address) => {
        navigator.clipboard.writeText(address);
        setCopiedAddress(address);
        setTimeout(() => setCopiedAddress(null), 2000);
        toast({
            title: "Copied",
            description: "Address copied to clipboard",
        });
    };
    const formatAddress = (address) => {
        return `${address.slice(0, 6)}...${address.slice(-6)}`;
    };
    const getNetworkColor = (network) => {
        switch (network) {
            case 'solana':
                return 'bg-purple-100 text-purple-800';
            case 'ethereum':
                return 'bg-blue-100 text-blue-800';
            case 'polygon':
                return 'bg-indigo-100 text-indigo-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    if (isLoading) {
        return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Merchant Addresses" }) }), _jsx(CardContent, { children: _jsx("div", { className: "animate-pulse space-y-4", children: [...Array(3)].map((_, i) => (_jsx("div", { className: "h-20 bg-gray-200 rounded" }, i))) }) })] }));
    }
    if (error) {
        return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Merchant Addresses" }) }), _jsxs(CardContent, { children: [_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error }) }), _jsx(Button, { onClick: fetchAddresses, className: "mt-4", children: "Retry" })] })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Wallet, { className: "h-5 w-5" }), "Merchant Addresses"] }), _jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Manage your receiving addresses for different networks" })] }), _jsxs(Button, { onClick: () => setIsAddModalOpen(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Address"] })] }), _jsx(CardContent, { children: addresses.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(Wallet, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), _jsx("p", { className: "mb-2", children: "No merchant addresses configured" }), _jsx("p", { className: "text-sm", children: "Add your first receiving address to get started" })] })) : (_jsx("div", { className: "space-y-4", children: addresses.map((address) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Wallet, { className: "h-5 w-5 text-gray-600" }), address.is_default && (_jsx(Star, { className: "h-4 w-4 text-yellow-500 fill-current" }))] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "font-medium", children: address.label }), _jsx(Badge, { className: getNetworkColor(address.network), children: address.network }), address.is_default && (_jsx(Badge, { variant: "outline", className: "text-yellow-600 border-yellow-300", children: "Default" }))] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("code", { className: "text-sm bg-gray-100 px-2 py-1 rounded font-mono", children: formatAddress(address.address) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleCopyAddress(address.address), className: "h-6 w-6 p-0", children: copiedAddress === address.address ? (_jsx(Check, { className: "h-3 w-3 text-green-600" })) : (_jsx(Copy, { className: "h-3 w-3" })) })] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [!address.is_default && (_jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleSetDefault(address.id), children: [_jsx(Star, { className: "h-4 w-4 mr-1" }), "Set Default"] })), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setEditingAddress(address), children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleDeleteAddress(address.id), className: "text-red-600 hover:text-red-700", children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }, address.id))) })) })] }), _jsx(AddAddressModal, { isOpen: isAddModalOpen, onClose: () => setIsAddModalOpen(false), onSubmit: handleAddAddress }), editingAddress && (_jsx(EditAddressModal, { address: editingAddress, isOpen: !!editingAddress, onClose: () => setEditingAddress(null), onSubmit: (updates) => handleEditAddress(editingAddress.id, updates) }))] }));
}
