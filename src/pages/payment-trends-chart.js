import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { analyticsApi } from "@/lib/api/analytics";
export function PaymentTrendsChart({ userId }) {
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchTrendData = async () => {
            try {
                const history = await analyticsApi.getPaymentHistory(userId, 1, 50);
                // Group payments by day for the last 7 days
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - i));
                    return date;
                });
                const trends = last7Days.map(date => {
                    const dayName = date.toLocaleDateString('en', { weekday: 'short' });
                    const dateStr = date.toISOString().split('T')[0];
                    const paymentsCount = history.filter(payment => {
                        const paymentDate = new Date(payment.created_at).toISOString().split('T')[0];
                        return paymentDate === dateStr;
                    }).length;
                    return {
                        name: dayName,
                        payments: paymentsCount,
                        date: dateStr,
                    };
                });
                setTrendData(trends);
            }
            catch (error) {
                console.error('Failed to fetch trend data:', error);
                // Fallback to empty data
                setTrendData([
                    { name: 'Mon', payments: 0, date: '' },
                    { name: 'Tue', payments: 0, date: '' },
                    { name: 'Wed', payments: 0, date: '' },
                    { name: 'Thu', payments: 0, date: '' },
                    { name: 'Fri', payments: 0, date: '' },
                    { name: 'Sat', payments: 0, date: '' },
                    { name: 'Sun', payments: 0, date: '' },
                ]);
            }
            finally {
                setLoading(false);
            }
        };
        if (userId) {
            fetchTrendData();
        }
    }, [userId]);
    if (loading) {
        return (_jsxs(Card, { "data-testid": "chart-payment-trends", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg font-semibold text-foreground", children: "Payment Trends" }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-64 flex items-center justify-center", children: _jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Skeleton, { className: "h-4 w-full" }), _jsx(Skeleton, { className: "h-4 w-3/4" }), _jsx(Skeleton, { className: "h-4 w-1/2" }), _jsx(Skeleton, { className: "h-32 w-full" })] }) }) })] }));
    }
    const totalPayments = trendData.reduce((sum, day) => sum + day.payments, 0);
    return (_jsxs(Card, { "data-testid": "chart-payment-trends", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg font-semibold text-foreground", children: "Payment Trends (Last 7 Days)" }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-64", children: totalPayments === 0 ? (_jsx("div", { className: "flex items-center justify-center h-full text-muted-foreground", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm", children: "No payments in the last 7 days" }), _jsx("p", { className: "text-xs mt-1", children: "Create your first payment to see trends" })] }) })) : (_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: trendData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", className: "stroke-muted" }), _jsx(XAxis, { dataKey: "name", className: "text-xs fill-muted-foreground", tickLine: false, axisLine: false }), _jsx(YAxis, { className: "text-xs fill-muted-foreground", tickLine: false, axisLine: false }), _jsx(Line, { type: "monotone", dataKey: "payments", stroke: "hsl(var(--primary))", strokeWidth: 2, dot: { fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }, activeDot: { r: 6, fill: "hsl(var(--primary))" } })] }) })) }) })] }));
}
