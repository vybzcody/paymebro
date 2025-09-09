import { MetricsCards } from "./metrics-cards";
import { PaymentTrendsChart } from "../../pages/payment-trends-chart";
import { RecentPayments } from "../../pages/recent-payments";
import { QuickActions } from "./quick-actions";
import { Button } from "@/components/ui/button";
import { Plus, LayoutTemplate, Wallet } from "lucide-react";

interface User {
  first_name?: string;
  web3auth_user_id: string;
}

interface DashboardProps {
  user: User;
  onCreatePayment: () => void;
  onViewTemplates: () => void;
  onViewWallets?: () => void;
}

export function Dashboard({ user, onCreatePayment, onViewTemplates, onViewWallets }: DashboardProps) {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, <span>{user.first_name || "User"}</span>!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here's what's happening with your payments today.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
          <Button onClick={onCreatePayment} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Payment
          </Button>
          <Button onClick={onViewTemplates} variant="outline" className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4" />
            Templates
          </Button>
          {onViewWallets && (
            <Button onClick={onViewWallets} variant="outline" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Wallets
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <MetricsCards userId={user.web3auth_user_id} />

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PaymentTrendsChart userId={user.web3auth_user_id} />
        <RecentPayments userId={user.web3auth_user_id} />
      </div>

      {/* Quick Actions */}
      <QuickActions
        onCreatePayment={onCreatePayment}
        onCreateTemplate={onViewTemplates}
        onViewAnalytics={() => { }}

      // onViewTemplates={onViewTemplates}
      // onViewWallets={onViewWallets}
      />
    </div>
  );
}