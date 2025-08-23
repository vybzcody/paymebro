import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Send, CreditCard, TrendingUp, Users, DollarSign } from "lucide-react";
import { StatCard } from "./StatCard";
import { QRGenerator } from "./QRGenerator";

export const Dashboard = () => {
  return (
    <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="opacity-0 animate-fade-in-up">
            <StatCard
              title="Total Revenue"
              value="$12,435"
              icon={<DollarSign className="w-4 h-4" />}
              trend="+12.5%"
            />
          </div>
          <div className="opacity-0 animate-fade-in-up animate-delay-100">
            <StatCard
              title="Active Customers"
              value="2,847"
              icon={<Users className="w-4 h-4" />}
              trend="+8.2%"
            />
          </div>
          <div className="opacity-0 animate-fade-in-up animate-delay-200">
            <StatCard
              title="Transactions"
              value="1,239"
              icon={<CreditCard className="w-4 h-4" />}
              trend="+15.3%"
            />
          </div>
          <div className="opacity-0 animate-fade-in-up animate-delay-300">
            <StatCard
              title="Growth Rate"
              value="23.4%"
              icon={<TrendingUp className="w-4 h-4" />}
              trend="+2.1%"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="opacity-0 animate-slide-in-left animate-delay-400">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-primary/5 to-primary/10 card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-primary" />
                  Generate Payment QR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QRGenerator />
              </CardContent>
            </Card>
          </div>

          <div className="opacity-0 animate-slide-in-right animate-delay-400">
            <Card className="shadow-lg border-0 card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-accent" />
                  Quick Invoice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer Email</label>
                  <input 
                    type="email" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                    placeholder="customer@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (USDC)</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                    placeholder="0.00"
                  />
                </div>
                <Button className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground btn-press">
                  Send Invoice
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="opacity-0 animate-fade-in-up animate-delay-500">
          <Card className="shadow-lg border-0 card-hover">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: "1", customer: "John Doe", amount: "$45.20", status: "Completed", time: "2 min ago" },
                  { id: "2", customer: "Jane Smith", amount: "$120.00", status: "Pending", time: "5 min ago" },
                  { id: "3", customer: "Mike Johnson", amount: "$89.50", status: "Completed", time: "12 min ago" },
                ].map((transaction, index) => (
                  <div 
                    key={transaction.id} 
                    className={`flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-all duration-200 cursor-pointer opacity-0 animate-fade-in-up`}
                    style={{ animationDelay: `${600 + index * 100}ms` }}
                  >
                    <div>
                      <p className="font-medium">{transaction.customer}</p>
                      <p className="text-sm text-muted-foreground">{transaction.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{transaction.amount}</p>
                      <p className={`text-sm ${
                        transaction.status === 'Completed' ? 'text-primary' : 'text-accent'
                      }`}>
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
};
