import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  CreditCard,
  Eye,
  Edit,
  Trash2,
  UserPlus
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Customers = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const customers = [
    {
      id: "CUST001",
      name: "John Doe",
      email: "john@example.com",
      phone: "+234 801 234 5678",
      location: "Lagos, Nigeria",
      joinDate: "2024-01-15",
      totalSpent: "$2,450.00",
      totalTransactions: 12,
      lastTransaction: "2024-01-20",
      status: "active",
      avatar: "JD"
    },
    {
      id: "CUST002",
      name: "Sarah Wilson",
      email: "sarah@business.com",
      phone: "+254 712 345 678",
      location: "Nairobi, Kenya",
      joinDate: "2024-01-10",
      totalSpent: "$1,890.50",
      totalTransactions: 8,
      lastTransaction: "2024-01-19",
      status: "active",
      avatar: "SW"
    },
    {
      id: "CUST003",
      name: "Mike Johnson",
      email: "mike@shop.com",
      phone: "+233 24 123 4567",
      location: "Accra, Ghana",
      joinDate: "2024-01-08",
      totalSpent: "$3,234.75",
      totalTransactions: 15,
      lastTransaction: "2024-01-21",
      status: "active",
      avatar: "MJ"
    },
    {
      id: "CUST004",
      name: "Grace Mbeki",
      email: "grace@local.co.za",
      phone: "+27 82 123 4567",
      location: "Cape Town, South Africa",
      joinDate: "2024-01-05",
      totalSpent: "$567.80",
      totalTransactions: 4,
      lastTransaction: "2024-01-18",
      status: "inactive",
      avatar: "GM"
    },
    {
      id: "CUST005",
      name: "Ahmed Hassan",
      email: "ahmed@tech.eg",
      phone: "+20 10 1234 5678",
      location: "Cairo, Egypt",
      joinDate: "2024-01-12",
      totalSpent: "$1,456.25",
      totalTransactions: 9,
      lastTransaction: "2024-01-22",
      status: "active",
      avatar: "AH"
    }
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomer = () => {
    toast({
      title: "Add Customer",
      description: "Customer creation form would open here",
    });
  };

  const handleViewCustomer = (customerId: string) => {
    setSelectedCustomer(customerId);
    toast({
      title: "Customer Details",
      description: `Viewing details for customer ${customerId}`,
    });
  };

  const handleEditCustomer = (customerId: string) => {
    toast({
      title: "Edit Customer",
      description: `Edit form for customer ${customerId} would open here`,
    });
  };

  const handleDeleteCustomer = (customerId: string) => {
    toast({
      title: "Delete Customer",
      description: `Confirmation dialog for deleting customer ${customerId}`,
      variant: "destructive",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-primary/10 text-primary";
      case "inactive": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 opacity-0 animate-fade-in-down">
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="text-muted-foreground">Manage your customer relationships and payment history</p>
          </div>
          <Button onClick={handleAddCustomer} className="gap-2 btn-press">
            <UserPlus className="w-4 h-4" />
            Add Customer
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <UserPlus className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                  <p className="text-xl font-semibold">{customers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-xl font-semibold">$9,598.30</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CreditCard className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Transaction</p>
                  <p className="text-xl font-semibold">$199.96</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active This Month</p>
                  <p className="text-xl font-semibold">4</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search customers by name, email, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
                <select className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>All Locations</option>
                  <option>Nigeria</option>
                  <option>Kenya</option>
                  <option>Ghana</option>
                  <option>South Africa</option>
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {customer.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{customer.name}</h3>
                      <p className="text-sm text-muted-foreground">{customer.id}</p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(customer.status)} capitalize`}>
                    {customer.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{customer.location}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                    <p className="font-semibold text-primary">{customer.totalSpent}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Transactions</p>
                    <p className="font-semibold">{customer.totalTransactions}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-1">Last Transaction</p>
                  <p className="text-sm">{customer.lastTransaction}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewCustomer(customer.id)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCustomer(customer.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCustomer(customer.id)}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No customers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Try adjusting your search terms" : "Start by adding your first customer"}
              </p>
              <Button onClick={handleAddCustomer}>
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </CardContent>
          </Card>
        )}
    </div>
  );
};

export default Customers;
