import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const mockData = [
  { name: 'Mon', payments: 12 },
  { name: 'Tue', payments: 19 },
  { name: 'Wed', payments: 3 },
  { name: 'Thu', payments: 5 },
  { name: 'Fri', payments: 2 },
  { name: 'Sat', payments: 3 },
  { name: 'Sun', payments: 9 },
];

export function PaymentTrendsChart() {
  return (
    <Card data-testid="chart-payment-trends">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Payment Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="text-xs fill-muted-foreground" 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                className="text-xs fill-muted-foreground" 
                tickLine={false}
                axisLine={false}
              />
              <Line 
                type="monotone" 
                dataKey="payments" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
