import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Mail, Send, Clock, CheckCircle, XCircle } from "lucide-react";
import { appConfig, getApiHeaders } from "@/lib/config";
export function NotificationManagement({ userId }) {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        fetchNotifications();
    }, [userId]);
    const fetchNotifications = async () => {
        try {
            const response = await fetch(`${appConfig.apiUrl}/api/notifications/user/${userId}`, {
                headers: getApiHeaders(userId)
            });
            const result = await response.json();
            if (result.success) {
                setNotifications(result.notifications || []);
            }
        }
        catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const processNotifications = async () => {
        try {
            const response = await fetch(`${appConfig.apiUrl}/api/notifications/process`, {
                method: 'POST',
                headers: getApiHeaders(userId)
            });
            const result = await response.json();
            if (result.success) {
                fetchNotifications(); // Refresh list
            }
        }
        catch (error) {
            console.error('Failed to process notifications:', error);
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'sent':
                return _jsx(CheckCircle, { className: "h-4 w-4 text-green-600" });
            case 'pending':
                return _jsx(Clock, { className: "h-4 w-4 text-yellow-600" });
            case 'failed':
                return _jsx(XCircle, { className: "h-4 w-4 text-red-600" });
            default:
                return _jsx(Mail, { className: "h-4 w-4 text-gray-600" });
        }
    };
    const getTypeColor = (type) => {
        switch (type) {
            case 'invoice':
                return 'bg-blue-100 text-blue-800';
            case 'confirmation':
                return 'bg-green-100 text-green-800';
            case 'reminder':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    if (isLoading) {
        return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Notification Management" }) }), _jsx(CardContent, { children: _jsx("div", { className: "animate-pulse space-y-4", children: [...Array(3)].map((_, i) => (_jsx("div", { className: "h-16 bg-gray-200 rounded" }, i))) }) })] }));
    }
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Mail, { className: "h-5 w-5" }), "Notification Management"] }), _jsxs(Button, { onClick: processNotifications, size: "sm", children: [_jsx(Send, { className: "h-4 w-4 mr-2" }), "Process Pending"] })] }), _jsx(CardContent, { children: notifications.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(Mail, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), _jsx("p", { children: "No notifications found" })] })) : (_jsx("div", { className: "space-y-4", children: notifications.map((notification) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [getStatusIcon(notification.status), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Badge, { className: getTypeColor(notification.type), children: notification.type }), _jsxs("span", { className: "text-sm text-gray-600", children: ["to ", notification.email] })] }), _jsx("p", { className: "font-medium", children: notification.subject }), _jsxs("p", { className: "text-sm text-gray-500", children: [new Date(notification.created_at).toLocaleDateString(), notification.sent_at && (_jsxs("span", { children: [" \u2022 Sent ", new Date(notification.sent_at).toLocaleDateString()] }))] })] })] }), _jsx(Badge, { variant: notification.status === 'sent' ? 'default' : 'secondary', children: notification.status })] }, notification.id))) })) })] }));
}
