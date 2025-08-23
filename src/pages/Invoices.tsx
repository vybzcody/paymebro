import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateInvoiceModal } from "@/components/CreateInvoiceModal";
import { ExportModal } from "@/components/ExportModal";
import { Plus, Send, Eye, Edit, Trash2, Download, Search, Filter } from "lucide-react";
import { useState } from "react";

const Invoices = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

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
      amount: "$890.25",
      status: "draft",
      dueDate: "2024-01-30",
      createdDate: "2024-01-12",
      description: "Software licensing"
    },
    {
      id: "INV004",
      customer: "StartUp Ghana",
      email: "pay@startup.gh",
      amount: "$325.50",
      status: "overdue",
      dueDate: "2024-01-15",
      createdDate: "2024-01-01",
      description: "Consulting services"
    },
    {
      id: "INV005",
      customer: "Digital Agency SA",
      email: "accounts@digitalagency.co.za",
      amount: "$675.80",
      status: "paid",
      dueDate: "2024-01-18",
      createdDate: "2024-01-03",
      description: "Marketing campaign"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-primary/10 text-primary";
      case "sent": return "bg-accent/10 text-accent";
      case "draft": return "bg-muted text-muted-foreground";
      case "overdue": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
  const pendingInvoices = invoices.filter(inv => inv.status === 'sent').length;
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  const exportData = {
    headers: [
      'Invoice ID',
      'Customer Name',
      'Email',
      'Amount',
      'Status',
      'Due Date',
      'Created Date',
      'Description'
    ],
    rows: invoices.map(invoice => [
      invoice.id,
      invoice.customer,
      invoice.email,
      invoice.amount,
      invoice.status,
      invoice.dueDate,
      invoice.createdDate,
      invoice.description
    ]),
    filename: 'afripay_invoices',
    title: 'Invoice Records Report'
  };

  return (
    <div>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 opacity-0 animate-fade-in-down">
          <div>
            <h1 className="text-3xl font-bold">Invoices</h1>
            <p className="text-muted-foreground">Create and manage your payment invoices</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 btn-press" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 btn-press">
              <Plus className="w-4 h-4" />
              Create Invoice
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 opacity-0 animate-fade-in-up animate-delay-100">
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Plus className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Invoices</p>
                  <p className="text-xl font-semibold">{totalInvoices}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Eye className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paid</p>
                  <p className="text-xl font-semibold">{paidInvoices}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Send className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-xl font-semibold">{pendingInvoices}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-xl font-semibold">{overdueInvoices}</p>
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
                    placeholder="Search invoices, customers, or amounts..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                  />
                </div>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200">
                    <option>All Status</option>
                    <option>Paid</option>
                    <option>Sent</option>
                    <option>Draft</option>
                    <option>Overdue</option>
                  </select>
                  <Button variant="outline" size="sm" className="btn-press">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices Table */}
        <div className="opacity-0 animate-fade-in-up animate-delay-300">
          <Card className="border-0 shadow-sm card-hover">
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Invoice ID</th>
                      <th className="text-left py-3 px-4 font-medium">Customer</th>
                      <th className="text-left py-3 px-4 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Due Date</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice, index) => (
                      <tr
                        key={invoice.id}
                        className={`border-b hover:bg-muted/50 transition-all duration-200 opacity-0 animate-fade-in-up`}
                        style={{ animationDelay: `${400 + index * 100}ms` }}
                      >
                        <td className="py-4 px-4">
                          <div className="font-mono text-sm">{invoice.id}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium">{invoice.customer}</div>
                            <div className="text-sm text-muted-foreground">{invoice.email}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold">{invoice.amount}</div>
                          <div className="text-xs text-muted-foreground">USDC</div>
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
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="btn-press">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="btn-press">
                              <Send className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="btn-press">
                              <Edit className="w-4 h-4" />
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-0 animate-fade-in-up animate-delay-500">
          <Card className="cursor-pointer card-hover" onClick={() => setIsCreateModalOpen(true)}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Create New Invoice</h3>
              <p className="text-sm text-muted-foreground">Generate a new invoice for your customers</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer card-hover">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Send className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Send Reminders</h3>
              <p className="text-sm text-muted-foreground">Send payment reminders to customers</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer card-hover" onClick={handleExport}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Download className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Export Reports</h3>
              <p className="text-sm text-muted-foreground">Download invoice reports and summaries</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={exportData}
        type="invoices"
      />
    </div>
  );
};

export default Invoices;
