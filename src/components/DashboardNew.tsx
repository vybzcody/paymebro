import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeAnalytics } from '@/hooks/useRealtimeAnalytics';
import { AnalyticsFilters } from '@/hooks/useAnalytics';
import { RevenueMetrics } from '@/components/analytics/RevenueMetrics';
import { AnalyticsFilters as FiltersComponent } from '@/components/analytics/AnalyticsFilters';
import { CurrencyBreakdown } from '@/components/analytics/CurrencyBreakdown';
import { RealtimeDebug } from '@/components/RealtimeDebug';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { GroupPaymentModal } from '@/components/GroupPaymentModal';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, QrCode, Link, FileText, TrendingUp, Zap, Repeat, Users, Mail } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

export const Dashboard = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: 'month',
    currency: 'all',
    status: 'all'
  });

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showGroupPaymentModal, setShowGroupPaymentModal] = useState(false);

  const { metrics, loading } = useRealtimeAnalytics(filters);

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
      title: "Email Invoice",
      description: "Send a professional invoice",
      icon: Mail,
      href: "/invoices",
      color: "bg-purple-500"
    }
  ];

  const hackathonFeatures = [
    {
      title: "Recurring Payments",
      description: "Set up automated subscriptions",
      icon: Repeat,
      action: () => setShowSubscriptionModal(true),
      color: "bg-orange-500",
      badge: "NEW"
    },
    {
      title: "Split Group Payment",
      description: "Divide expenses among friends",
      icon: Users,
      action: () => setShowGroupPaymentModal(true),
      color: "bg-pink-500",
      badge: "NEW"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
            <Zap className="h-6 w-6 ml-2 text-yellow-500" title="Real-time updates enabled" />
          </h1>
          <p className="text-gray-500 mt-1">
            Live dashboard with programmable commerce features
          </p>
        </div>
        <div className="flex gap-3">
          <RealtimeDebug />
          <Button asChild>
            <RouterLink to="/qr-codes">
              <Plus className="h-4 w-4 mr-2" />
              Create Payment
            </RouterLink>
          </Button>
        </div>
      </div>

      {/* Analytics Filters */}
      <FiltersComponent filters={filters} onFiltersChange={setFilters} />

      {/* Revenue Metrics */}
      <RevenueMetrics metrics={metrics} loading={loading} />

      {/* Hackathon Features - Programmable Commerce */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-500" />
            Programmable Commerce Features
            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              MetaMask Hackathon
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {hackathonFeatures.map((feature) => (
              <div
                key={feature.title}
                onClick={feature.action}
                className="group p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer relative"
              >
                {feature.badge && (
                  <span className="absolute top-2 right-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {feature.badge}
                  </span>
                )}
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${feature.color} text-white`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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

      {/* Modals */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
      
      <GroupPaymentModal
        isOpen={showGroupPaymentModal}
        onClose={() => setShowGroupPaymentModal(false)}
      />
    </div>
  );
};
