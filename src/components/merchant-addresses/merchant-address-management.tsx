import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback } from "react";
import { Plus, Wallet, Star, Trash2, Edit, Copy, Check } from "lucide-react";
import { merchantAddressesApi, type MerchantAddress } from "@/lib/api/merchant-addresses";
import { AddAddressModal } from "./add-address-modal";
import { EditAddressModal } from "./edit-address-modal";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MerchantAddressManagementProps {
    userId: string;
}

export function MerchantAddressManagement({ userId }: MerchantAddressManagementProps) {
    const { toast } = useToast();
    const [addresses, setAddresses] = useState<MerchantAddress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<MerchantAddress | null>(null);
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

    const fetchAddresses = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await merchantAddressesApi.getUserAddresses(userId);
            setAddresses(data);
        } catch (error) {
            console.error('Failed to fetch merchant addresses:', error);
            setError('Failed to load merchant addresses');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchAddresses();
        }
    }, [fetchAddresses]);

    const handleAddAddress = async (addressData: any) => {
        try {
            await merchantAddressesApi.addAddress(userId, addressData);
            await fetchAddresses();
            setIsAddModalOpen(false);
            toast({
                title: "Success",
                description: "Merchant address added successfully",
            });
        } catch (error) {
            console.error('Failed to add address:', error);
            toast({
                title: "Error",
                description: "Failed to add merchant address",
                variant: "destructive",
            });
            throw error;
        }
    };

    const handleEditAddress = async (addressId: string, updates: any) => {
        try {
            await merchantAddressesApi.updateAddress(userId, addressId, updates);
            await fetchAddresses();
            setEditingAddress(null);
            toast({
                title: "Success",
                description: "Merchant address updated successfully",
            });
        } catch (error) {
            console.error('Failed to update address:', error);
            toast({
                title: "Error",
                description: "Failed to update merchant address",
                variant: "destructive",
            });
            throw error;
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        try {
            await merchantAddressesApi.deleteAddress(userId, addressId);
            await fetchAddresses();
            toast({
                title: "Success",
                description: "Merchant address deleted successfully",
            });
        } catch (error) {
            console.error('Failed to delete address:', error);
            toast({
                title: "Error",
                description: "Failed to delete merchant address",
                variant: "destructive",
            });
        }
    };

    const handleSetDefault = async (addressId: string) => {
        try {
            await merchantAddressesApi.setDefaultAddress(userId, addressId);
            await fetchAddresses();
            toast({
                title: "Success",
                description: "Default address updated successfully",
            });
        } catch (error) {
            console.error('Failed to set default address:', error);
            toast({
                title: "Error",
                description: "Failed to set default address",
                variant: "destructive",
            });
        }
    };

    const handleCopyAddress = (address: string) => {
        navigator.clipboard.writeText(address);
        setCopiedAddress(address);
        setTimeout(() => setCopiedAddress(null), 2000);
        toast({
            title: "Copied",
            description: "Address copied to clipboard",
        });
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-6)}`;
    };

    const getNetworkColor = (network: string) => {
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
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Merchant Addresses</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-20 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Merchant Addresses</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    <Button onClick={fetchAddresses} className="mt-4">
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            Merchant Addresses
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage your receiving addresses for different networks
                        </p>
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Address
                    </Button>
                </CardHeader>
                <CardContent>
                    {addresses.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="mb-2">No merchant addresses configured</p>
                            <p className="text-sm">Add your first receiving address to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {addresses.map((address) => (
                                <div
                                    key={address.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <Wallet className="h-5 w-5 text-gray-600" />
                                            {address.is_default && (
                                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium">{address.label}</span>
                                                <Badge className={getNetworkColor(address.network)}>
                                                    {address.network}
                                                </Badge>
                                                {address.is_default && (
                                                    <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                                                        Default
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                                                    {formatAddress(address.address)}
                                                </code>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleCopyAddress(address.address)}
                                                    className="h-6 w-6 p-0"
                                                >
                                                    {copiedAddress === address.address ? (
                                                        <Check className="h-3 w-3 text-green-600" />
                                                    ) : (
                                                        <Copy className="h-3 w-3" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!address.is_default && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSetDefault(address.id)}
                                            >
                                                <Star className="h-4 w-4 mr-1" />
                                                Set Default
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setEditingAddress(address)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteAddress(address.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <AddAddressModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddAddress}
            />

            {editingAddress && (
                <EditAddressModal
                    address={editingAddress}
                    isOpen={!!editingAddress}
                    onClose={() => setEditingAddress(null)}
                    onSubmit={(updates) => handleEditAddress(editingAddress.id, updates)}
                />
            )}
        </div>
    );
}