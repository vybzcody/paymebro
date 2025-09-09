import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

interface Wallet {
  id: string;
  name: string;
  address: string;
  balance: string;
  currency: string;
  usdValue: string;
  network: string;
  type: 'primary' | 'secondary';
}

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
}

export function WithdrawModal({ isOpen, onClose, wallets }: WithdrawModalProps) {
  const [selectedWallet, setSelectedWallet] = useState("");
  const [amount, setAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
          <DialogDescription>
            Convert your cryptocurrency to cash
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wallet">Select Wallet</Label>
            <Select value={selectedWallet} onValueChange={setSelectedWallet}>
              <SelectTrigger>
                <SelectValue placeholder="Choose wallet to withdraw from" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name} - {wallet.balance} {wallet.currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Withdrawal Method</Label>
            <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select withdrawal method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="card">Debit Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Coming Soon Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Feature Coming Soon</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Fiat withdrawals will be available soon. We're integrating with payment processors 
                  to provide seamless crypto-to-cash conversions.
                </p>
                <Badge variant="secondary" className="mt-2">
                  Q1 2025
                </Badge>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Preview Withdrawal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
