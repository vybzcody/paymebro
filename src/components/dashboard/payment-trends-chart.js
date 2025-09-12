import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "h-5 w-5 text-green-600" }), "Payment Trends"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "space-y-4", children: chartData.map((data) => (_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 text-sm font-medium text-muted-foreground", children: data.day }), _jsx("div", { className: "flex-1", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex-1 bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300", style: {
                                                        width: `${(data.payments / maxPayments) * 100}%`,
                                                    } }) }), _jsx("div", { className: "w-8 text-sm font-medium text-right", children: data.payments })] }) })] }, data.day))) }), _jsx("div", { className: "mt-6 pt-4 border-t", children: _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Total this week" }), _jsxs("span", { className: "font-semibold text-green-600", children: [chartData.reduce((sum, d) => sum + d.payments, 0), " payments"] })] }) })] })] }));
}
