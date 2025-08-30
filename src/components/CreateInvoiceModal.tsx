import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Send, 
  Eye, 
  Calendar,
  DollarSign,
  FileText,
  User
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { createInvoice } from "@/services/businessService";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateInvoiceModal = ({ isOpen, onClose }: CreateInvoiceModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [invoiceData, setInvoiceData] = useState({
    customerName: "",
    customerEmail: "",
    customerAddress: "",
    invoiceNumber: `INV-${Date.now()}`,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    notes: "",
    terms: "",
    sendEmail: true,
    allowPartialPayment: false,
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, rate: 0, amount: 0 }
  ]);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = subtotal * 0.075; // 7.5% tax
  const total = subtotal + tax;

  const handleCreateInvoice = async () => {
    if (!invoiceData.customerName || !invoiceData.customerEmail || items.some(item => !item.description || item.rate <= 0)) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in to create invoices",
        variant: "destructive",
      });
      return;
    }

    try {
      const invoice = await createInvoice(user.id, {
        merchantName: user.name || 'AfriPay Merchant',
        merchantEmail: user.email || '',
        merchantWallet: '', // TODO: Get from Web3Auth context
        customerName: invoiceData.customerName,
        customerEmail: invoiceData.customerEmail,
        amount: total,
        currency: 'USDC',
        description: invoiceData.notes || items.map(item => item.description).join(', '),
        dueDate: invoiceData.dueDate,
        notes: invoiceData.notes,
        sendEmail: invoiceData.sendEmail
      });

      // Send email if requested
      if (invoiceData.sendEmail) {
        // TODO: Integrate with backend email service
        console.log('Sending invoice email to:', invoiceData.customerEmail);
        
        toast({
          title: "Invoice Created & Sent",
          description: `Invoice ${invoice.invoice_number} sent to ${invoiceData.customerEmail}`,
        });
      } else {
        toast({
          title: "Invoice Created",
          description: `Invoice ${invoice.invoice_number} saved as draft`,
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePreview = () => {
    setCurrentStep(3);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Create New Invoice
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  currentStep > step ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Customer Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={invoiceData.customerName}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Enter customer name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email Address *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={invoiceData.customerEmail}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="customer@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerAddress">Billing Address</Label>
              <Textarea
                id="customerAddress"
                value={invoiceData.customerAddress}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, customerAddress: e.target.value }))}
                placeholder="Enter customer's billing address"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={invoiceData.issueDate}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, issueDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={invoiceData.dueDate}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep(2)}>
                Next: Add Items
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Invoice Items</h3>
              </div>
              <Button onClick={addItem} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 items-end p-4 border rounded-lg">
                  <div className="col-span-5">
                    <Label className="text-sm">Description *</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm">Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm">Rate (USDC)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm">Amount</Label>
                    <div className="px-3 py-2 bg-muted/50 rounded-lg text-sm font-medium">
                      ${item.amount.toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t pt-4">
              <div className="max-w-sm ml-auto space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (7.5%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>${total.toFixed(2)} USDC</span>
                </div>
              </div>
            </div>

            {/* Notes and Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={invoiceData.notes}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes for the customer"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={invoiceData.terms}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, terms: e.target.value }))}
                  placeholder="Payment terms and conditions"
                  rows={3}
                />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Send email to customer</p>
                  <p className="text-sm text-muted-foreground">Automatically send invoice via email</p>
                </div>
                <Switch
                  checked={invoiceData.sendEmail}
                  onCheckedChange={(checked) => setInvoiceData(prev => ({ ...prev, sendEmail: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow partial payments</p>
                  <p className="text-sm text-muted-foreground">Customer can pay in installments</p>
                </div>
                <Switch
                  checked={invoiceData.allowPartialPayment}
                  onCheckedChange={(checked) => setInvoiceData(prev => ({ ...prev, allowPartialPayment: checked }))}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={handlePreview}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={handleCreateInvoice}>
                  <Send className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Invoice Preview</h3>
              <Badge variant="secondary">This is how your invoice will look</Badge>
            </div>

            {/* Invoice Preview */}
            <div className="border rounded-lg p-6 bg-card">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-primary">AfriPay</h2>
                  <p className="text-sm text-muted-foreground">Merchant Dashboard</p>
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-semibold">INVOICE</h3>
                  <p className="text-sm text-muted-foreground">{invoiceData.invoiceNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold mb-2">Bill To:</h4>
                  <p className="font-medium">{invoiceData.customerName}</p>
                  <p className="text-sm text-muted-foreground">{invoiceData.customerEmail}</p>
                  {invoiceData.customerAddress && (
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {invoiceData.customerAddress}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Issue Date:</span>
                      <span className="text-sm">{invoiceData.issueDate}</span>
                    </div>
                    {invoiceData.dueDate && (
                      <div className="flex justify-between">
                        <span className="text-sm">Due Date:</span>
                        <span className="text-sm">{invoiceData.dueDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Description</th>
                      <th className="text-center py-2">Qty</th>
                      <th className="text-right py-2">Rate</th>
                      <th className="text-right py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2">{item.description}</td>
                        <td className="text-center py-2">{item.quantity}</td>
                        <td className="text-right py-2">${item.rate.toFixed(2)}</td>
                        <td className="text-right py-2">${item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-6">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (7.5%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>${total.toFixed(2)} USDC</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {(invoiceData.notes || invoiceData.terms) && (
                <div className="space-y-4">
                  {invoiceData.notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Notes:</h4>
                      <p className="text-sm text-muted-foreground">{invoiceData.notes}</p>
                    </div>
                  )}
                  {invoiceData.terms && (
                    <div>
                      <h4 className="font-semibold mb-2">Terms & Conditions:</h4>
                      <p className="text-sm text-muted-foreground">{invoiceData.terms}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Back to Edit
              </Button>
              <Button onClick={handleCreateInvoice}>
                <Send className="w-4 h-4 mr-2" />
                Create & Send Invoice
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
