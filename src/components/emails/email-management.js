import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import { appConfig, getApiHeaders } from '@/lib/config';
import { useToast } from '@/hooks/use-toast';
export function EmailManagement({ userId }) {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [sendingTest, setSendingTest] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const { toast } = useToast();
    const fetchEmails = async (isRefresh = false) => {
        if (isRefresh)
            setRefreshing(true);
        try {
            const response = await fetch(`${appConfig.apiUrl}/api/emails/pending`, {
                headers: getApiHeaders(userId),
            });
            if (response.ok) {
                const result = await response.json();
                setEmails(result.emails || []);
            }
        }
        catch (error) {
            console.error('Failed to fetch emails:', error);
            toast({
                title: "Error",
                description: "Failed to fetch emails",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    const processEmails = async () => {
        setProcessing(true);
        try {
            const response = await fetch(`${appConfig.apiUrl}/api/emails/process`, {
                method: 'POST',
                headers: getApiHeaders(userId),
            });
            if (response.ok) {
                const result = await response.json();
                toast({
                    title: "Emails Processed",
                    description: result.message,
                });
                fetchEmails(true);
            }
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to process emails",
                variant: "destructive",
            });
        }
        finally {
            setProcessing(false);
        }
    };
    const sendTestEmail = async () => {
        if (!testEmail.trim()) {
            toast({
                title: "Error",
                description: "Please enter an email address",
                variant: "destructive",
            });
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(testEmail)) {
            toast({
                title: "Error",
                description: "Please enter a valid email address",
                variant: "destructive",
            });
            return;
        }
        setSendingTest(true);
        try {
            const response = await fetch(`${appConfig.apiUrl}/api/emails/test`, {
                method: 'POST',
                headers: getApiHeaders(userId),
                body: JSON.stringify({
                    email: testEmail.trim(),
                    userId: userId,
                }),
            });
            if (response.ok) {
                toast({
                    title: "Test Email Queued",
                    description: `Test email queued for ${testEmail}`,
                });
                setTestEmail('');
                fetchEmails(true);
            }
            else {
                throw new Error('Failed to send test email');
            }
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to send test email",
                variant: "destructive",
            });
        }
        finally {
            setSendingTest(false);
        }
    };
    useEffect(() => {
        fetchEmails();
    }, [userId]);
    const LoadingSkeleton = () => (_jsx("div", { className: "space-y-3", children: [1, 2, 3].map((i) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "space-y-2 flex-1", children: [_jsx(Skeleton, { className: "h-4 w-3/4" }), _jsx(Skeleton, { className: "h-3 w-1/2" }), _jsx(Skeleton, { className: "h-3 w-1/3" })] }), _jsx(Skeleton, { className: "h-6 w-16" })] }, i))) }));
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: ["Email Notifications", _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: () => fetchEmails(true), disabled: refreshing, variant: "outline", size: "sm", children: _jsx(RefreshCw, { className: `h-4 w-4 ${refreshing ? 'animate-spin' : ''}` }) }), _jsx(Button, { onClick: processEmails, disabled: processing, size: "sm", children: processing ? 'Processing...' : 'Process Queue' })] })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "mb-6 p-4 border rounded-lg", children: [_jsx(Label, { htmlFor: "test-email", className: "text-sm font-medium", children: "Send Test Email" }), _jsxs("div", { className: "flex gap-2 mt-2", children: [_jsx(Input, { id: "test-email", type: "email", placeholder: "Enter email address to test", value: testEmail, onChange: (e) => setTestEmail(e.target.value), onKeyDown: (e) => e.key === 'Enter' && sendTestEmail(), className: "flex-1" }), _jsx(Button, { onClick: sendTestEmail, disabled: sendingTest || !testEmail.trim(), size: "sm", children: sendingTest ? 'Sending...' : 'Send Test' })] })] }), loading ? (_jsx(LoadingSkeleton, {})) : emails.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("p", { className: "text-muted-foreground", children: "No email notifications found" }), _jsx(Button, { onClick: () => fetchEmails(true), variant: "outline", size: "sm", className: "mt-2", children: "Refresh" })] })) : (_jsx("div", { className: "space-y-3", children: emails.map((email) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: email.subject }), _jsx("p", { className: "text-sm text-muted-foreground", children: email.email }), _jsx("p", { className: "text-xs text-muted-foreground", children: new Date(email.created_at).toLocaleString() }), email.error_message && (_jsx("p", { className: "text-xs text-destructive mt-1", children: email.error_message }))] }), _jsx(Badge, { variant: email.status === 'sent' ? 'default' :
                                        email.status === 'failed' ? 'destructive' : 'secondary', children: email.status })] }, email.id))) }))] })] }));
}
