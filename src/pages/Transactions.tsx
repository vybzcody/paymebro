import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, DollarSign, Search } from "lucide-react";
import { EmptyState, TransactionSkeleton } from "@/components/EmptyStates";
import { useTransactions } from "@/hooks/useTransactions";
import { useState } from "react";

const Transactions = () => {
  const { transactions, loading } = useTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500">Track all payment transactions</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by customer, email, or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      {loading ? (
        <TransactionSkeleton />
      ) : filteredTransactions.length === 0 ? (
        <EmptyState type="transactions" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Transactions ({filteredTransactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{tx.customer_name || 'Anonymous'}</p>
                      <p className="text-sm text-gray-500">{tx.customer_email}</p>
                      <p className="text-xs text-gray-400">Ref: {tx.reference}</p>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <p className="font-semibold">${tx.amount} {tx.currency}</p>
                    <p className="text-sm text-gray-500">Net: ${tx.net_amount}</p>
                    <Badge variant={getStatusColor(tx.status)}>
                      {tx.status}
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

export default Transactions;
