import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { type MerchantAddress } from "@/lib/api/merchant-addresses";

interface EditAddressModalProps {
    address: MerchantAddress;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (updates: any) => Promise<void>;
}

export function EditAddressModal({ address, isOpen, onClose, onSubmit }: EditAddressModalProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        label: '',
        isDefault: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (address) {
            setFormData({
                label: address.label,
                isDefault: address.is_default
            });
        }
    }, [address]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.label.trim()) {
            toast({
                title: "Missing Label",
                description: "Please provide a label for the address",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit({
                label: formData.label.trim(),
                is_default: formData.isDefault
            });
        } catch (error) {
            // Error is handled by parent component
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
    };

    const getNetworkColor = (network: string) => {
        switch (network) {
            case 'solana':
                return 'text-purple-600';
            case 'ethereum':
                return 'text-blue-600';
            case 'polygon':
                return 'text-indigo-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Merchant Address</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Address</span>
                            <span className={`text-sm font-medium capitalize ${getNetworkColor(address.network)}`}>
                                {address.network}
                            </span>
                        </div>
                        <code className="text-sm font-mono text-gray-600">
                            {formatAddress(address.address)}
                        </code>
                        <p className="text-xs text-gray-500 mt-1">
                            Address cannot be changed
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="label">Label</Label>
                        <Input
                            id="label"
                            value={formData.label}
                            onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                            placeholder="Main Wallet, Business Account, etc."
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="isDefault">Set as default address</Label>
                            <p className="text-sm text-muted-foreground">
                                Use this address for new payments by default
                            </p>
                        </div>
                        <Switch
                            id="isDefault"
                            checked={formData.isDefault}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
                        />
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="flex-1">
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}