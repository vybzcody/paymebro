import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, DollarSign } from "lucide-react";
import { EmptyState, TransactionSkeleton } from "@/components/EmptyStates";
import { useInvoices } from "@/hooks/useInvoices";

const Invoices = () => {
  const { invoices, loading } = useInvoices();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'sent': return 'secondary';
      case 'overdue': return 'destructive';
      case 'draft': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500">Create and manage invoices</p>
        </div>
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
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <p className="font-semibold">${invoice.amount} {invoice.currency}</p>
                    <p className="text-sm text-gray-500">Due: {invoice.due_date}</p>
                    <Badge variant={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Invoices;
