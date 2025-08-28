import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics, AnalyticsFilters } from '@/hooks/useAnalytics';
import { RevenueMetrics } from '@/components/analytics/RevenueMetrics';
import { AnalyticsFilters as FiltersComponent } from '@/components/analytics/AnalyticsFilters';
import { CurrencyBreakdown } from '@/components/analytics/CurrencyBreakdown';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, QrCode, Link, FileText, TrendingUp } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

export const Dashboard = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: 'month',
    currency: 'all',
    status: 'all'
  });

  const { metrics, loading } = useAnalytics(filters);

  const quickActions = [
    {
      title: "Create QR Code",
      description: "Generate a new payment QR code",
      icon: QrCode,
      href: "/qr-codes",
      color: "bg-blue-500"
    },
    {
      title: "Payment Link",
      description: "Create a shareable payment link",
      icon: Link,
      href: "/payment-links",
      color: "bg-green-500"
    },
    {
      title: "New Invoice",
      description: "Send a professional invoice",
      icon: FileText,
      href: "/invoices",
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening with your payments today.
          </p>
        </div>
        <Button asChild>
          <RouterLink to="/qr-codes">
            <Plus className="h-4 w-4 mr-2" />
            Create Payment
          </RouterLink>
        </Button>
      </div>

      {/* Analytics Filters */}
      <FiltersComponent filters={filters} onFiltersChange={setFilters} />

      {/* Revenue Metrics */}
      <RevenueMetrics metrics={metrics} loading={loading} />

      {/* Secondary Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        <CurrencyBreakdown metrics={metrics} loading={loading} />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Transaction</span>
              <span className="font-medium">
                ${metrics.totalTransactions > 0 ? (metrics.totalRevenue / metrics.totalTransactions).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Growth Rate</span>
              <span className={`font-medium ${metrics.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.growth >= 0 ? '+' : ''}{metrics.growth.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Revenue per Day</span>
              <span className="font-medium">
                ${(metrics.totalRevenue / 30).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action) => (
              <RouterLink
                key={action.title}
                to={action.href}
                className="group p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </RouterLink>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
