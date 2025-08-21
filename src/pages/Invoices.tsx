import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Plus, Send, Eye, Edit, Trash2, Download } from "lucide-react";

const Invoices = () => {
  const invoices = [
    {
      id: "INV001",
      customer: "ABC Corp",
      email: "billing@abccorp.com",
      amount: "$1,250.00",
      status: "paid",
      dueDate: "2024-01-20",
      createdDate: "2024-01-05",
      description: "Web development services"
    },
    {
      id: "INV002",
      customer: "Local Market Ltd",
      email: "admin@localmarket.co.ke",
      amount: "$450.75",
      status: "sent",
      dueDate: "2024-01-25",
      createdDate: "2024-01-10",
      description: "Monthly subscription"
    },
    {
      id: "INV003",
      customer: "Tech Solutions",
      email: "finance@techsol.ng",
      amount: "$890.50",
      status: "overdue",
      dueDate: "2024-01-12",
      createdDate: "2023-12-28",
      description: "Software license"
    },
    {
      id: "INV004",
      customer: "StartUp Ghana",
      email: "pay@startup.gh",
      amount: "$325.25",
      status: "draft",
      dueDate: "2024-01-30",
      createdDate: "2024-01-15",
      description: "Consulting services"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-primary/10 text-primary";
      case "sent": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "overdue": return "bg-destructive/10 text-destructive";
      case "draft": return "bg-muted text-muted-foreground";
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
              <h1 className="text-3xl font-bold">Invoices</h1>
              <p className="text-muted-foreground">Create and manage your payment invoices</p>
            </div>
            <Button className="gap-2 bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90">
              <Plus className="w-4 h-4" />
              Create Invoice
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Invoices</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Send className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Paid</p>
                    <p className="text-2xl font-bold text-primary">$8,420</p>
                  </div>
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Badge className="w-4 h-4 bg-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-accent">$2,160</p>
                  </div>
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Badge className="w-4 h-4 bg-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                    <p className="text-2xl font-bold text-destructive">$890</p>
                  </div>
                  <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <Badge className="w-4 h-4 bg-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoices Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Invoices</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <select className="px-3 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>All Status</option>
                  <option>Paid</option>
                  <option>Sent</option>
                  <option>Overdue</option>
                  <option>Draft</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Invoice</th>
                      <th className="text-left py-3 px-4 font-medium">Customer</th>
                      <th className="text-left py-3 px-4 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Due Date</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-mono text-sm font-medium">{invoice.id}</div>
                            <div className="text-xs text-muted-foreground">{invoice.description}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium">{invoice.customer}</div>
                            <div className="text-sm text-muted-foreground">{invoice.email}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold">{invoice.amount}</span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`${getStatusColor(invoice.status)} capitalize`}>
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm">{invoice.dueDate}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Send className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
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

export default Invoices;