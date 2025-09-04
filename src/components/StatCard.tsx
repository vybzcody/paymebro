import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend: string;
}

export const StatCard = ({ title, value, icon, trend }: StatCardProps) => {
  const isPositive = trend.startsWith('+');
  
  return (
    <Card className="shadow-lg border-0 card-hover bg-gradient-to-br from-card to-card/95">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary transition-all duration-300 hover:bg-primary/20">
              {icon}
            </div>
          </div>
          <div className={`text-xs font-medium px-2 py-1 rounded-full transition-all duration-300 ${
            isPositive 
              ? 'bg-primary/10 text-primary hover:bg-primary/20' 
              : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
          }`}>
            {trend}
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold text-foreground">{value}</h3>
          <p className="text-sm text-muted-foreground mt-1">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
};