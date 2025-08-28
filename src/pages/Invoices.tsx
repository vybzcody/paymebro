import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, DollarSign, Plus, Mail, Send } from "lucide-react";
import { EmptyState, TransactionSkeleton } from "@/components/EmptyStates";
import { EmailInvoiceModal } from "@/components/EmailInvoiceModal";
import { useInvoices } from "@/hooks/useInvoices";
import { invoiceService } from "@/services/invoiceService";
import { toast } from 'sonner';

const Invoices = () => {
  const { invoices, loading, refetch } = useInvoices();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [sendingInvoice, setSendingInvoice] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'sent': return 'secondary';
      case 'overdue': return 'destructive';
      case 'draft': return 'outline';
      default: return 'secondary';
    }
  };

  const handleSendInvoice = async (invoiceId: string, customerEmail: string) => {
    setSendingInvoice(invoiceId);
    try {
      await invoiceService.sendInvoice(invoiceId);
      toast.success(`Invoice sent to ${customerEmail}`);
      refetch(); // Refresh the list
    } catch (error: any) {
      toast.error('Failed to send invoice', {
        description: error.message
      });
    } finally {
      setSendingInvoice(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500">Create and manage email invoices</p>
        </div>
        <Button onClick={() => setShowEmailModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Email Invoice
        </Button>
      </div>

      {loading ? (
        <TransactionSkeleton />
      ) : invoices.length === 0 ? (
        <EmptyState type="invoices" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Invoices ({invoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.customer_name}</p>
                      <p className="text-sm text-gray-500">{invoice.customer_email}</p>
                      <p className="text-xs text-gray-400">{invoice.description}</p>
                      <p className="text-xs text-gray-400">
                        Created: {new Date(invoice.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-2">
                    <p className="font-semibold">${invoice.amount} {invoice.currency}</p>
                    <p className="text-sm text-gray-500">Due: {formatDate(invoice.due_date)}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                      {invoice.status === 'draft' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendInvoice(invoice.id, invoice.customer_email)}
                          disabled={sendingInvoice === invoice.id}
                        >
                          {sendingInvoice === invoice.id ? (
                            'Sending...'
                          ) : (
                            <>
                              <Send className="h-3 w-3 mr-1" />
                              Send
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <EmailInvoiceModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSuccess={refetch}
      />
    </div>
  );
};

export default Invoices;
