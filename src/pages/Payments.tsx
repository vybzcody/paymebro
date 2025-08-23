import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TransactionModal } from "@/components/TransactionModal";
import { ExportModal } from "@/components/ExportModal";
import { Search, Filter, Download, Eye, MoreHorizontal } from "lucide-react";
import { useState } from "react";

const Payments = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const payments = [
    {
      id: "PMT001",
      customer: "John Doe",
      email: "john@example.com",
      amount: "$125.50",
      currency: "USDC",
      status: "completed",
      method: "QR Code",
      date: "2024-01-15",
      time: "14:30:25",
      txHash: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      fee: "$1.88",
      walletAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      confirmations: 32,
      blockHeight: 245678901,
      description: "Payment for electronics purchase"
    },
    {
      id: "PMT002",
      customer: "Sarah Wilson",
      email: "sarah@business.com",
      amount: "$89.25",
      currency: "USDC",
      status: "pending",
      method: "Invoice",
      date: "2024-01-15",
      time: "16:45:12",
      txHash: "pending",
      fee: "$1.34",
      walletAddress: "8yLZug3DX98e08UKTEqc6D6kCkhfUqB94UaSrKptgBtV",
      confirmations: 0,
      blockHeight: 0,
      description: "Monthly subscription payment"
    },
    {
      id: "PMT003",
      customer: "Mike Johnson",
      email: "mike@shop.com",
      amount: "$234.75",
      currency: "USDC",
      status: "completed",
      method: "Embed Button",
      date: "2024-01-14",
      time: "09:15:33",
      txHash: "8yLZug3DX98e08UKTEqc6D6kCkhfUqB94UaSrKptgBtV",
      fee: "$3.52",
      walletAddress: "9zMabc4EY09f19VLUFrd7E7lDkigVrC05VbTsLquhCtW",
      confirmations: 32,
      blockHeight: 245678850,
      description: "Bulk order payment"
    },
    {
      id: "PMT004",
      customer: "Grace Mbeki",
      email: "grace@local.co.za",
      amount: "$67.80",
      currency: "USDC",
      status: "failed",
      method: "QR Code",
      date: "2024-01-14",
      time: "11:22:45",
      txHash: "failed",
      fee: "$0.00",
      walletAddress: "AzNdef5FZ10g20WMVGse8F8mEljWsD06WcUuMqvihDuX",
      confirmations: 0,
      blockHeight: 0,
      description: "Product purchase - payment failed"
    },
    {
      id: "PMT005",
      customer: "Ahmed Hassan",
      email: "ahmed@tech.eg",
      amount: "$456.30",
      currency: "USDC",
      status: "completed",
      method: "QR Code",
      date: "2024-01-13",
      time: "13:20:15",
      txHash: "BzOdef6GA11h21XNWHtf9G9nFmkXtE07XdVvNrwjiEvY",
      fee: "$6.84",
      walletAddress: "BzOdef6GA11h21XNWHtf9G9nFmkXtE07XdVvNrwjiEvY",
      confirmations: 32,
      blockHeight: 245678800,
      description: "Software license payment"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-primary/10 text-primary";
      case "pending": return "bg-accent/10 text-accent";
      case "failed": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleViewTransaction = (payment: any) => {
    setSelectedTransaction(payment);
    setIsModalOpen(true);
  };

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  const exportData = {
    headers: [
      'Payment ID',
      'Customer Name',
      'Email',
      'Amount',
      'Currency',
      'Status',
      'Method',
      'Date',
      'Time',
      'Transaction Hash',
      'Fee',
      'Description'
    ],
    rows: payments.map(payment => [
      payment.id,
      payment.customer,
      payment.email,
      payment.amount,
      payment.currency,
      payment.status,
      payment.method,
      payment.date,
      payment.time,
      payment.txHash,
      payment.fee,
      payment.description
    ]),
    filename: 'afripay_payments',
    title: 'Payment Transactions Report'
  };

  return (
    <div>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 opacity-0 animate-fade-in-down">
          <div>
            <h1 className="text-3xl font-bold">Payments</h1>
            <p className="text-muted-foreground">Manage and track all your USDC transactions</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 btn-press" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button className="gap-2 btn-press">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 opacity-0 animate-fade-in-up animate-delay-100">
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Download className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Payments</p>
                  <p className="text-xl font-semibold">{payments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Download className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-xl font-semibold">{payments.filter(p => p.status === 'completed').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Download className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-xl font-semibold">{payments.filter(p => p.status === 'pending').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <Download className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-xl font-semibold">{payments.filter(p => p.status === 'failed').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="opacity-0 animate-fade-in-up animate-delay-200">
          <Card className="border-0 shadow-sm card-hover">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search payments, customers, or transaction IDs..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                  />
                </div>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200">
                    <option>All Status</option>
                    <option>Completed</option>
                    <option>Pending</option>
                    <option>Failed</option>
                  </select>
                  <select className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200">
                    <option>All Methods</option>
                    <option>QR Code</option>
                    <option>Invoice</option>
                    <option>Embed Button</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <div className="opacity-0 animate-fade-in-up animate-delay-300">
          <Card className="border-0 shadow-sm card-hover">
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Payment ID</th>
                      <th className="text-left py-3 px-4 font-medium">Customer</th>
                      <th className="text-left py-3 px-4 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Method</th>
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, index) => (
                      <tr
                        key={payment.id}
                        className={`border-b hover:bg-muted/50 transition-all duration-200 cursor-pointer opacity-0 animate-fade-in-up`}
                        style={{ animationDelay: `${400 + index * 100}ms` }}
                      >
                        <td className="py-4 px-4">
                          <div className="font-mono text-sm">{payment.id}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium">{payment.customer}</div>
                            <div className="text-sm text-muted-foreground">{payment.email}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold">{payment.amount}</div>
                          <div className="text-xs text-muted-foreground">{payment.currency}</div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`${getStatusColor(payment.status)} capitalize`}>
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm">{payment.method}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm">{payment.date}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewTransaction(payment)}
                              className="btn-press"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="btn-press">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTransaction}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={exportData}
        type="payments"
      />
    </div>
  );
};

export default Payments;