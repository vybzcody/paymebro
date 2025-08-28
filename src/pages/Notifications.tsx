import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, Clock, DollarSign } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { EmptyState, TransactionSkeleton } from "@/components/EmptyStates";

const Notifications = () => {
  const { transactions, loading } = useTransactions();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500">Recent payment activity and updates</p>
        </div>
      </div>

      {loading ? (
        <TransactionSkeleton />
      ) : transactions.length === 0 ? (
        <EmptyState type="transactions" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Recent Transactions ({transactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Payment Received</p>
                      <p className="text-sm text-gray-500">
                        {transaction.amount} {transaction.currency}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <p className="font-semibold text-green-600">
                      +{transaction.amount} {transaction.currency}
                    </p>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(transaction.status)}
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                    {transaction.signature && (
                      <p className="text-xs text-gray-400 font-mono">
                        {transaction.signature.slice(0, 8)}...{transaction.signature.slice(-8)}
                      </p>
                    )}
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

export default Notifications;
