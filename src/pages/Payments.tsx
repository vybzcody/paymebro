import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Search, Filter, Download, Eye, MoreHorizontal } from "lucide-react";

const Payments = () => {
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
      txHash: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
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
      txHash: "pending"
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
      txHash: "8yLZug3DX98e08UKTEqc6D6kCkhfUqB94UaSrKptgBtV"
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
      txHash: "failed"
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Payments</h1>
              <p className="text-muted-foreground">Manage and track all your USDC transactions</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search payments, customers, or transaction IDs..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>All Status</option>
                    <option>Completed</option>
                    <option>Pending</option>
                    <option>Failed</option>
                  </select>
                  <select className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>All Methods</option>
                    <option>QR Code</option>
                    <option>Invoice</option>
                    <option>Embed Button</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card className="border-0 shadow-sm">
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
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b hover:bg-muted/50 transition-colors">
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
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
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
      </main>
    </div>
  );
};

export default Payments;