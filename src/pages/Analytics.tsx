import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/DashboardHeader";
import { TrendingUp, TrendingDown, Users, CreditCard, Calendar, Download } from "lucide-react";

const Analytics = () => {
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Analytics</h1>
              <p className="text-muted-foreground">Track your payment performance and customer insights</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Calendar className="w-4 h-4" />
                Last 30 Days
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-3xl font-bold text-primary">$27,650</p>
                    <div className="flex items-center mt-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-primary mr-1" />
                      <span className="text-primary">+12.5%</span>
                      <span className="text-muted-foreground ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Transactions</p>
                    <p className="text-3xl font-bold">351</p>
                    <div className="flex items-center mt-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-primary mr-1" />
                      <span className="text-primary">+8.2%</span>
                      <span className="text-muted-foreground ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Customers</p>
                    <p className="text-3xl font-bold">127</p>
                    <div className="flex items-center mt-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-primary mr-1" />
                      <span className="text-primary">+15.3%</span>
                      <span className="text-muted-foreground ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Transaction</p>
                    <p className="text-3xl font-bold">$78.75</p>
                    <div className="flex items-center mt-2 text-sm">
                      <TrendingDown className="w-4 h-4 text-destructive mr-1" />
                      <span className="text-destructive">-2.1%</span>
                      <span className="text-muted-foreground ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-64 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-end justify-around p-4">
                    {chartData.map((data, index) => (
                      <div key={data.month} className="flex flex-col items-center">
                        <div 
                          className="w-8 bg-gradient-to-t from-primary to-primary-glow rounded-t-sm mb-2"
                          style={{ height: `${(data.revenue / 5200) * 200}px` }}
                        />
                        <span className="text-xs text-muted-foreground">{data.month}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>$0</span>
                    <span>$5,200</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods.map((method, index) => (
                    <div key={method.method} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${
                          index === 0 ? 'bg-primary' : 
                          index === 1 ? 'bg-accent' : 'bg-muted'
                        }`} />
                        <span className="font-medium">{method.method}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{method.percentage}%</div>
                        <div className="text-sm text-muted-foreground">{method.amount}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Customers */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Customer</th>
                      <th className="text-left py-3 px-4 font-medium">Total Spent</th>
                      <th className="text-left py-3 px-4 font-medium">Transactions</th>
                      <th className="text-left py-3 px-4 font-medium">Avg Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCustomers.map((customer, index) => (
                      <tr key={customer.name} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-primary font-semibold text-sm">
                                {customer.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{customer.name}</div>
                              <div className="text-sm text-muted-foreground">{customer.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-primary">{customer.spent}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span>{customer.transactions}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span>${(parseFloat(customer.spent.replace('$', '').replace(',', '')) / customer.transactions).toFixed(0)}</span>
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

export default Analytics;