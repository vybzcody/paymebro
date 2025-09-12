import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { paymentsApi, type CreatePaymentRequest } from "@/lib/api/payments";
import { merchantAddressesApi, type MerchantAddress } from "@/lib/api/merchant-addresses";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Wallet, Plus } from "lucide-react";

interface CreatePaymentWithAddressProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentCreated: (payment: any) => void;
    userId: string;
    userWalletAddress?: string; // Current Web3Auth wallet address
}

export function CreatePaymentWithAddress({
    isOpen,
    onClose,
    onPaymentCreated,
    userId,
    userWalletAddress
}: CreatePaymentWithAddressProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        amount: '',
        label: '',
        message: '',
        memo: '',
        customerEmail: '',
        currency: 'USDC',
        merchantWallet: '', // Custom merchant wallet
        useCustomAddress: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addresses, setAddresses] = useState<MerchantAddress[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<string>('');

    const fetchAddresses = useCallback(async () => {
        try {
            setLoadingAddresses(true);
            const userAddresses = await merchantAddressesApi.getUserAddresses(userId);
            setAddresses(userAddresses);

            // Auto-select default address if available
            const defaultAddress = userAddresses.find(addr => addr.is_default && addr.network === 'solana');
            if (defaultAddress) {
                setSelectedAddressId(defaultAddress.id);
            }
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
        } finally {
            setLoadingAddresses(false);
        }
    }, [userId]);

    useEffect(() => {
        if (isOpen && userId) {
            fetchAddresses();
        }
    }, [isOpen, userId, fetchAddresses]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.amount || !formData.label) {
            toast({
                title: "Missing Fields",
                description: "Please fill in amount and label",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Determine merchant wallet address
            let merchantWallet = undefined;

            if (formData.useCustomAddress && formData.merchantWallet) {
                merchantWallet = formData.merchantWallet;
            } else if (selectedAddressId) {
                const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
                if (selectedAddress) {
                    merchantWallet = selectedAddress.address;
                }
            } else if (addresses.length === 0 && userWalletAddress) {
                // Use user's connected wallet address as fallback
                merchantWallet = userWalletAddress;
            }

            const paymentData: CreatePaymentRequest = {
                amount: parseFloat(formData.amount),
                label: formData.label,
                message: formData.message || undefined,
                memo: formData.memo || undefined,
                customerEmail: formData.customerEmail || undefined,
                web3AuthUserId: userId,
                chain: 'solana',
                splToken: formData.currency === 'USDC' ? 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr' : undefined,
                merchantWallet
            };

            const result = await paymentsApi.createPayment(paymentData);

            toast({
                title: "Payment Created!",
                description: `Payment link generated for ${formData.amount} ${formData.currency}`,
            });

            onPaymentCreated(result);
            handleClose();
        } catch (error) {
            console.error('Failed to create payment:', error);
            toast({
                title: "Creation Failed",
                description: error instanceof Error ? error.message : "Failed to create payment",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            amount: '',
            label: '',
            message: '',
            memo: '',
            customerEmail: '',
            currency: 'USDC',
            merchantWallet: '',
            useCustomAddress: false
        });
        setSelectedAddressId('');
        onClose();
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-6)}`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Payment</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="currency">Currency</Label>
                            <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USDC">USDC</SelectItem>
                                    <SelectItem value="SOL">SOL</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="label">Payment Label</Label>
                        <Input
                            id="label"
                            value={formData.label}
                            onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                            placeholder="Product name or service description"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="message">Message (optional)</Label>
                        <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                            placeholder="Additional message for the customer"
                            rows={2}
                        />
                    </div>

                    <div>
                        <Label htmlFor="customerEmail">Customer Email (optional)</Label>
                        <Input
                            id="customerEmail"
                            type="email"
                            value={formData.customerEmail}
                            onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                            placeholder="customer@example.com"
                        />
                    </div>

                    {/* Receiving Address Selection */}
                    <div className="space-y-3">
                        <Label>Receiving Address</Label>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="useCustomAddress">Use custom address</Label>
                                <p className="text-sm text-muted-foreground">
                                    Override default address for this payment
                                </p>
                            </div>
                            <Switch
                                id="useCustomAddress"
                                checked={formData.useCustomAddress}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, useCustomAddress: checked }))}
                            />
                        </div>

                        {formData.useCustomAddress ? (
                            <div>
                                <Label htmlFor="merchantWallet">Custom Wallet Address</Label>
                                <Input
                                    id="merchantWallet"
                                    value={formData.merchantWallet}
                                    onChange={(e) => setFormData(prev => ({ ...prev, merchantWallet: e.target.value }))}
                                    placeholder="Enter Solana wallet address"
                                    className="font-mono text-sm"
                                />
                            </div>
                        ) : (
                            <div>
                                <Label htmlFor="addressSelect">Select Address</Label>
                                {loadingAddresses ? (
                                    <div className="p-3 border rounded-lg">
                                        <div className="animate-pulse flex items-center space-x-2">
                                            <div className="h-4 w-4 bg-gray-200 rounded"></div>
                                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                                        </div>
                                    </div>
                                ) : addresses.length === 0 ? (
                                    <div className="space-y-3">
                                        {userWalletAddress ? (
                                            <Alert>
                                                <Wallet className="h-4 w-4" />
                                                <AlertDescription>
                                                    <div className="space-y-2">
                                                        <p>Using default address from your connected wallet:</p>
                                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                                            {formatAddress(userWalletAddress)}
                                                        </code>
                                                        <p className="text-xs text-muted-foreground">
                                                            You can add custom merchant addresses in settings.
                                                        </p>
                                                    </div>
                                                </AlertDescription>
                                            </Alert>
                                        ) : (
                                            <Alert>
                                                <Wallet className="h-4 w-4" />
                                                <AlertDescription>
                                                    No merchant addresses configured. Add an address in settings or use a custom address.
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                ) : (
                                    <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select receiving address" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {addresses
                                                .filter(addr => addr.network === 'solana')
                                                .map((address) => (
                                                    <SelectItem key={address.id} value={address.id}>
                                                        <div className="flex items-center justify-between w-full">
                                                            <span>{address.label}</span>
                                                            <span className="text-xs text-muted-foreground ml-2 font-mono">
                                                                {formatAddress(address.address)}
                                                            </span>
                                                            {address.is_default && (
                                                                <span className="text-xs bg-green-100 text-green-700 px-1 rounded ml-2">
                                                                    Default
                                                                </span>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="flex-1">
                            {isSubmitting ? 'Creating...' : 'Create Payment'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}