import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, LayoutTemplate, BarChart3 } from "lucide-react";

interface QuickActionsProps {
  onCreatePayment: () => void;
  onCreateTemplate: () => void;
  onViewAnalytics: () => void;
}

export function QuickActions({ 
  onCreatePayment, 
  onCreateTemplate, 
  onViewAnalytics 
}: QuickActionsProps) {
  const actions = [
    {
      title: "Create Payment",
      description: "Generate a new payment link",
      icon: Plus,
      onClick: onCreatePayment,
      iconClass: "text-primary",
      bgClass: "bg-primary/10",
      testId: "quick-action-create-payment"
    },
    {
      title: "Save LayoutTemplate",
      description: "Create reusable payment templates",
      icon: LayoutTemplate,
      onClick: onCreateTemplate,
      iconClass: "text-secondary",
      bgClass: "bg-secondary/10",
      testId: "quick-action-save-template"
    },
    {
      title: "View Analytics",
      description: "Detailed payment insights",
      icon: BarChart3,
      onClick: onViewAnalytics,
      iconClass: "text-accent",
      bgClass: "bg-accent/10",
      testId: "quick-action-view-analytics"
    },
  ];

  return (
    <Card data-testid="card-quick-actions">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                variant="outline"
                className="p-4 h-auto text-left hover:bg-muted/50 hover-scale"
                onClick={action.onClick}
                data-testid={action.testId}
              >
                <div className="flex items-center space-x-3 w-full">
                  <div className={`p-2 ${action.bgClass} rounded-lg`}>
                    <Icon className={`h-5 w-5 ${action.iconClass}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{action.title}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
