import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
/**
 * Test page to verify payment routes work correctly
 * This can be accessed at /test-payment for development purposes
 */
const TestPaymentPage = () => {
    const testReferences = [
        '58dXZq2t5Fkjh6yNJzvfwJaqFPYkof8MGyBJ8Kf16Uyz',
        'HhHzqDKCVN9XXpq4kvwTJkhEz2haqy3FCSGwYRf7We3z',
        'n5F2dLsqUK2hkrwb8g6Vn3r11QLNetytQM5zVKwQzp5',
        '7BfckaZJCnXpdgNdgZErJsCpSK9ZMq25P8grout1had5'
    ];
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-4", children: _jsx("div", { className: "max-w-2xl mx-auto", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Payment Page Testing" }), _jsx("p", { className: "text-gray-600", children: "Test the payment page component with various reference IDs" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("div", { className: "grid gap-3", children: testReferences.map((reference) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsx("div", { className: "flex-1", children: _jsxs("code", { className: "text-sm bg-gray-100 px-2 py-1 rounded", children: ["/payment/", reference] }) }), _jsx(Link, { href: `/payment/${reference}`, children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(ExternalLink, { className: "w-4 h-4 mr-2" }), "Test"] }) })] }, reference))) }), _jsxs("div", { className: "mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg", children: [_jsx("h3", { className: "font-semibold text-blue-900 mb-2", children: "Testing Notes:" }), _jsxs("ul", { className: "text-sm text-blue-800 space-y-1", children: [_jsx("li", { children: "\u2022 Payment pages should load without authentication" }), _jsx("li", { children: "\u2022 Each reference should show different payment details" }), _jsx("li", { children: "\u2022 QR codes should generate for pending payments" }), _jsx("li", { children: "\u2022 WebSocket connections should work for real-time updates" }), _jsx("li", { children: "\u2022 Status polling should work as fallback" })] })] }), _jsxs("div", { className: "mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg", children: [_jsx("h3", { className: "font-semibold text-yellow-900 mb-2", children: "Expected Behavior:" }), _jsxs("ul", { className: "text-sm text-yellow-800 space-y-1", children: [_jsx("li", { children: "\u2022 Valid references: Show payment details and QR code" }), _jsx("li", { children: "\u2022 Invalid references: Show \"Payment Not Found\" error" }), _jsx("li", { children: "\u2022 Confirmed payments: Show success message" }), _jsx("li", { children: "\u2022 Pending payments: Show QR code and monitoring" })] })] })] })] }) }) }));
};
export default TestPaymentPage;
