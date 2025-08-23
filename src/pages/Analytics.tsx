import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { ExportModal } from "@/components/ExportModal";
import { TrendingUp, TrendingDown, Users, CreditCard, Calendar, Download } from "lucide-react";
import { useState } from "react";

const Analytics = () => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const chartData = [
    { month: "Jan", revenue: 2400, transactions: 45 },
    { month: "Feb", revenue: 3200, transactions: 52 },
    { month: "Mar", revenue: 2800, transactions: 48 },
    { month: "Apr", revenue: 4100, transactions: 67 },
    { month: "May", revenue: 3800, transactions: 61 },
    { month: "Jun", revenue: 5200, transactions: 78 }
  ];

  const topCustomers = [
    { name: "ABC Corp", email: "billing@abccorp.com", spent: "$2,450", transactions: 12 },
    { name: "Local Market Ltd", email: "admin@localmarket.co.ke", spent: "$1,890", transactions: 8 },
    { name: "Tech Solutions", email: "finance@techsol.ng", spent: "$1,650", transactions: 15 },
    { name: "StartUp Ghana", email: "pay@startup.gh", spent: "$1,240", transactions: 6 }
  ];

  const paymentMethods = [
    { method: "QR Code", percentage: 45, amount: "$12,450" },
    { method: "Email Invoice", percentage: 35, amount: "$9,680" },
    { method: "Embed Button", percentage: 20, amount: "$5,520" }
  ];

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  const exportData = {
    headers: [
      'Month',
      'Revenue',
      'Transactions',
      'Top Customer',
      'Customer Spent',
      'Payment Method',
      'Method Percentage',
      'Method Amount'
    ],
    rows: chartData.map((data, index) => [
      data.month,
      `$${data.revenue}`,
      data.transactions,
      topCustomers[index]?.name || 'N/A',
      topCustomers[index]?.spent || 'N/A',
      paymentMethods[index % paymentMethods.length]?.method || 'N/A',
      `${paymentMethods[index % paymentMethods.length]?.percentage || 0}%`,
      paymentMethods[index % paymentMethods.length]?.amount || 'N/A'
    ]),
    filename: 'afripay_analytics',
    title: 'Analytics Performance Report'
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 opacity-0 animate-fade-in-down">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Track your payment performance and customer insights</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 btn-press">
              <Calendar className="w-4 h-4" />
              Last 30 Days
            </Button>
            <Button variant="outline" className="gap-2 btn-press" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 opacity-0 animate-fade-in-up animate-delay-100">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">$21,550</p>
                  <p className="text-xs text-primary flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    +12.5% from last month
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold">351</p>
                  <p className="text-xs text-primary flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    +8.2% from last month
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
                  <p className="text-2xl font-bold">127</p>
                  <p className="text-xs text-primary flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    +15.3% from last month
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Transaction</p>
                  <p className="text-2xl font-bold">$61.40</p>
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <TrendingDown className="w-3 h-3" />
                    -2.1% from last month
                  </p>
                </div>
                <div className="p-3 bg-accent/10 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="opacity-0 animate-slide-in-left animate-delay-200">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2 p-4">
                  {chartData.map((data, index) => (
                    <div key={data.month} className="flex flex-col items-center gap-2">
                      <div
                        className="bg-primary/20 rounded-t-lg w-8 transition-all duration-500 hover:bg-primary/30"
                        style={{
                          height: `${(data.revenue / 5200) * 200}px`,
                          animationDelay: `${300 + index * 100}ms`
                        }}
                      ></div>
                      <span className="text-xs text-muted-foreground">{data.month}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <div className="opacity-0 animate-slide-in-right animate-delay-200">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method, index) => (
                  <div key={method.method} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{method.method}</span>
                      <span className="font-medium">{method.percentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all duration-1000"
                        style={{
                          width: `${method.percentage}%`,
                          animationDelay: `${400 + index * 200}ms`
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground">{method.amount}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Top Customers */}
        <div className="opacity-0 animate-fade-in-up animate-delay-400">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div
                    key={customer.name}
                    className={`flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-all duration-200 opacity-0 animate-fade-in-up`}
                    style={{ animationDelay: `${500 + index * 100}ms` }}
                  >
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{customer.spent}</p>
                      <p className="text-sm text-muted-foreground">{customer.transactions} transactions</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={exportData}
        type="analytics"
      />
    </Layout>
  );
};

export default Analytics;

