import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { merchantAddressesApi } from "@/lib/api/merchant-addresses";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AddAddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (addressData: any) => Promise<void>;
}

export function AddAddressModal({ isOpen, onClose, onSubmit }: AddAddressModalProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        address: '',
        label: '',
        network: 'solana',
        isDefault: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const validateAddress = async (address: string, network: string) => {
        if (!address.trim()) {
            setValidationError(null);
            return;
        }

        try {
            const result = await merchantAddressesApi.validateAddress(address, network);
            if (!result.valid) {
                setValidationError(result.error || 'Invalid address format');
            } else {
                setValidationError(null);
            }
        } catch (error) {
            setValidationError('Failed to validate address');
        }
    };

    const handleAddressChange = (address: string) => {
        setFormData(prev => ({ ...prev, address }));
        validateAddress(address, formData.network);
    };

    const handleNetworkChange = (network: string) => {
        setFormData(prev => ({ ...prev, network }));
        if (formData.address) {
            validateAddress(formData.address, network);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.address || !formData.label) {
            toast({
                title: "Missing Fields",
                description: "Please fill in address and label",
                variant: "destructive"
            });
            return;
        }

        if (validationError) {
            toast({
                title: "Invalid Address",
                description: validationError,
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit({
                address: formData.address.trim(),
                label: formData.label.trim(),
                network: formData.network,
                is_default: formData.isDefault
            });

            // Reset form
            setFormData({
                address: '',
                label: '',
                network: 'solana',
                isDefault: false
            });
            setValidationError(null);
        } catch (error) {
            // Error is handled by parent component
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            address: '',
            label: '',
            network: 'solana',
            isDefault: false
        });
        setValidationError(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Merchant Address</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
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

                    <div>
                        <Label htmlFor="network">Network</Label>
                        <Select value={formData.network} onValueChange={handleNetworkChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="solana">Solana</SelectItem>
                                <SelectItem value="ethereum">Ethereum</SelectItem>
                                <SelectItem value="polygon">Polygon</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="address">Wallet Address</Label>
                        <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => handleAddressChange(e.target.value)}
                            placeholder={
                                formData.network === 'solana'
                                    ? 'e.g., 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
                                    : 'e.g., 0x742d35Cc6634C0532925a3b8D4C9db96DfbF31d2'
                            }
                            className="font-mono text-sm"
                            required
                        />
                        {validationError && (
                            <Alert variant="destructive" className="mt-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{validationError}</AlertDescription>
                            </Alert>
                        )}
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
                        <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !!validationError}
                            className="flex-1"
                        >
                            {isSubmitting ? 'Adding...' : 'Add Address'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}