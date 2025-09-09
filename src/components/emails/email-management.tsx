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

interface EmailNotification {
  id: string;
  email: string;
  type: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
  sent_at?: string;
  error_message?: string;
}

interface EmailManagementProps {
  userId: string;
}

export function EmailManagement({ userId }: EmailManagementProps) {
  const [emails, setEmails] = useState<EmailNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const { toast } = useToast();

  const fetchEmails = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const response = await fetch(`${appConfig.apiUrl}/api/emails/pending`, {
        headers: getApiHeaders(userId),
      });

      if (response.ok) {
        const result = await response.json();
        setEmails(result.emails || []);
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      toast({
        title: "Error",
        description: "Failed to fetch emails",
        variant: "destructive",
      });
    } finally {
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process emails",
        variant: "destructive",
      });
    } finally {
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
      } else {
        throw new Error('Failed to send test email');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setSendingTest(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [userId]);

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-3 border rounded">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Email Notifications
          <div className="flex gap-2">
            <Button 
              onClick={() => fetchEmails(true)} 
              disabled={refreshing}
              variant="outline" 
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={processEmails} disabled={processing} size="sm">
              {processing ? 'Processing...' : 'Process Queue'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 border rounded-lg">
          <Label htmlFor="test-email" className="text-sm font-medium">
            Send Test Email
          </Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="test-email"
              type="email"
              placeholder="Enter email address to test"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendTestEmail()}
              className="flex-1"
            />
            <Button 
              onClick={sendTestEmail} 
              disabled={sendingTest || !testEmail.trim()}
              size="sm"
            >
              {sendingTest ? 'Sending...' : 'Send Test'}
            </Button>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : emails.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No email notifications found</p>
            <Button 
              onClick={() => fetchEmails(true)} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Refresh
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {emails.map((email) => (
              <div key={email.id} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium">{email.subject}</p>
                  <p className="text-sm text-muted-foreground">{email.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(email.created_at).toLocaleString()}
                  </p>
                  {email.error_message && (
                    <p className="text-xs text-destructive mt-1">{email.error_message}</p>
                  )}
                </div>
                <Badge variant={email.status === 'sent' ? 'default' : 
                              email.status === 'failed' ? 'destructive' : 'secondary'}>
                  {email.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
