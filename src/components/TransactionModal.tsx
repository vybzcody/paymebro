import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Copy, 
  ExternalLink, 
  Download, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  CreditCard,
  Hash
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  customer: string;
  email: string;
  amount: string;
  currency: string;
  status: "completed" | "pending" | "failed";
  method: string;
  date: string;
  time: string;
  txHash: string;
  fee: string;
  description?: string;
  walletAddress: string;
  confirmations: number;
  blockHeight: number;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const TransactionModal = ({ isOpen, onClose, transaction }: TransactionModalProps) => {
  const { toast } = useToast();

  if (!transaction) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(transaction.txHash);
    toast({
      title: "Transaction Hash Copied",
      description: "Transaction hash copied to clipboard",
    });
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(transaction.walletAddress);
    toast({
      title: "Wallet Address Copied",
      description: "Wallet address copied to clipboard",
    });
  };

  const handleDownloadReceipt = () => {
    toast({
      title: "Receipt Downloaded",
      description: "Transaction receipt has been downloaded",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-primary" />;
      case "pending":
        return <Clock className="w-5 h-5 text-accent" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-primary/10 text-primary";
      case "pending": return "bg-accent/10 text-accent";
      case "failed": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon(transaction.status)}
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Amount */}
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold">{transaction.amount}</div>
            <div className="text-muted-foreground">{transaction.currency}</div>
            <Badge className={`${getStatusColor(transaction.status)} capitalize`}>
              {transaction.status}
            </Badge>
          </div>

          <Separator />

          {/* Transaction Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Transaction ID</p>
                  <p className="text-sm text-muted-foreground font-mono">{transaction.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Customer</p>
                  <p className="text-sm text-muted-foreground">{transaction.customer}</p>
                  <p className="text-xs text-muted-foreground">{transaction.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Date & Time</p>
                  <p className="text-sm text-muted-foreground">{transaction.date} at {transaction.time}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Payment Method</p>
                  <p className="text-sm text-muted-foreground">{transaction.method}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Confirmations</p>
                  <p className="text-sm text-muted-foreground">{transaction.confirmations}/32</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Block Height</p>
                  <p className="text-sm text-muted-foreground">{transaction.blockHeight.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Blockchain Details */}
          <div className="space-y-4">
            <h3 className="font-semibold">Blockchain Details</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-1">Transaction Hash</p>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                  <code className="text-xs flex-1 font-mono break-all">{transaction.txHash}</code>
                  <Button variant="ghost" size="sm" onClick={handleCopyHash}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Recipient Wallet</p>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                  <code className="text-xs flex-1 font-mono break-all">{transaction.walletAddress}</code>
                  <Button variant="ghost" size="sm" onClick={handleCopyAddress}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Fee Breakdown */}
          <div className="space-y-3">
            <h3 className="font-semibold">Fee Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{transaction.amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>AfriPay Fee (1.5%)</span>
                <span>{transaction.fee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Network Fee</span>
                <span>$0.001</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Received</span>
                <span>{transaction.amount}</span>
              </div>
            </div>
          </div>

          {transaction.description && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{transaction.description}</p>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleDownloadReceipt} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>
            <Button variant="outline" className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refund Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
