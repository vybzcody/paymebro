import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export function PaymentTrendsChart() {
  // Mock data for the chart
  const chartData = [
    { day: "Mon", payments: 12 },
    { day: "Tue", payments: 19 },
    { day: "Wed", payments: 15 },
    { day: "Thu", payments: 25 },
    { day: "Fri", payments: 22 },
    { day: "Sat", payments: 18 },
    { day: "Sun", payments: 14 },
  ];

  const maxPayments = Math.max(...chartData.map(d => d.payments));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Payment Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {chartData.map((data) => (
            <div key={data.day} className="flex items-center gap-4">
              <div className="w-12 text-sm font-medium text-muted-foreground">
                {data.day}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(data.payments / maxPayments) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="w-8 text-sm font-medium text-right">
                    {data.payments}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total this week</span>
            <span className="font-semibold text-green-600">
              {chartData.reduce((sum, d) => sum + d.payments, 0)} payments
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
