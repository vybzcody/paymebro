import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, LayoutTemplate, BarChart3, QrCode, Settings, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuickActionsProps {
  onCreatePayment: () => void;
  onCreateTemplate: () => void;
  onViewAnalytics: () => void;
}

export function QuickActions({ onCreatePayment, onCreateTemplate, onViewAnalytics }: QuickActionsProps) {
  const { toast } = useToast();

  const showComingSoon = (feature: string) => {
    toast({
      title: "Coming Soon!",
      description: `${feature} feature will be available in the next update.`,
    });
  };

  const actions = [
    {
      title: "Create Payment",
      description: "Generate a new payment QR code",
      icon: Plus,
      onClick: onCreatePayment,
      className: "bg-green-50 hover:bg-green-100 border-green-200",
      iconClass: "text-green-600",
    },
    {
      title: "Payment Template",
      description: "Create reusable payment templates",
      icon: LayoutTemplate,
      onClick: onCreateTemplate,
      className: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      iconClass: "text-blue-600",
    },
    {
      title: "View Analytics",
      description: "Check your payment statistics",
      icon: BarChart3,
      onClick: onViewAnalytics,
      className: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      iconClass: "text-purple-600",
    },
    {
      title: "QR Code Scanner",
      description: "Scan payment QR codes",
      icon: QrCode,
      onClick: () => showComingSoon("QR Code Scanner"),
      className: "bg-orange-50 hover:bg-orange-100 border-orange-200",
      iconClass: "text-orange-600",
    },
    {
      title: "Settings",
      description: "Manage your account settings",
      icon: Settings,
      onClick: () => showComingSoon("Settings"),
      className: "bg-gray-50 hover:bg-gray-100 border-gray-200",
      iconClass: "text-gray-600",
    },
    {
      title: "Export Data",
      description: "Download payment reports",
      icon: Download,
      onClick: () => showComingSoon("Export Data"),
      className: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200",
      iconClass: "text-indigo-600",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                variant="outline"
                className={`h-auto p-4 flex flex-col items-start gap-2 ${action.className}`}
                onClick={action.onClick}
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className={`h-5 w-5 ${action.iconClass}`} />
                  <span className="font-medium text-sm">{action.title}</span>
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  {action.description}
                </p>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
