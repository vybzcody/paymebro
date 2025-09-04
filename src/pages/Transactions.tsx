import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Filter, Zap, ExternalLink, DollarSign } from "lucide-react";
import { useRealtimeTransactions } from "@/hooks/useRealtimeTransactions";
import { EmptyState, TransactionSkeleton } from "@/components/EmptyStates";
import { useState } from "react";

const Transactions = () => {
  const { transactions, loading } = useRealtimeTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.signature?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.currency.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    const matchesCurrency = currencyFilter === 'all' || tx.currency === currencyFilter;
    
    return matchesSearch && matchesStatus && matchesCurrency;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const openInExplorer = (signature: string) => {
    window.open(`https://explorer.solana.com/tx/${signature}?cluster=devnet`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            Transactions
            <Zap className="h-5 w-5 ml-2 text-yellow-500" title="Real-time updates" />
          </h1>
          <p className="text-gray-500">Live transaction history and details</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by signature or currency..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Currencies</SelectItem>
                <SelectItem value="SOL">SOL</SelectItem>
                <SelectItem value="USDC">USDC</SelectItem>
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
            <CardTitle>Live Transaction Feed ({filteredTransactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Payment Transaction</p>
                      <p className="text-sm text-gray-500">
                        {transaction.amount} {transaction.currency}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(transaction.created_at)}
                      </p>
                      {transaction.signature && (
                        <p className="text-xs text-gray-400 font-mono">
                          {transaction.signature.slice(0, 12)}...{transaction.signature.slice(-12)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right space-y-2">
                    <p className="font-semibold text-green-600">
                      +{transaction.amount} {transaction.currency}
                    </p>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                    {transaction.signature && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openInExplorer(transaction.signature)}
                        className="text-xs"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Explorer
                      </Button>
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

export default Transactions;
