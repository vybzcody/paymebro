import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const fetchEmails = async () => {
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
    } finally {
      setLoading(false);
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
        fetchEmails(); // Refresh list
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
    try {
      const response = await fetch(`${appConfig.apiUrl}/api/emails/test`, {
        method: 'POST',
        headers: getApiHeaders(userId),
        body: JSON.stringify({
          email: 'test@example.com',
          userId: userId,
        }),
      });

      if (response.ok) {
        toast({
          title: "Test Email Sent",
          description: "Check your email queue",
        });
        fetchEmails();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [userId]);

  if (loading) {
    return <div>Loading email notifications...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Email Notifications
          <div className="space-x-2">
            <Button onClick={sendTestEmail} variant="outline" size="sm">
              Send Test
            </Button>
            <Button onClick={processEmails} disabled={processing} size="sm">
              {processing ? 'Processing...' : 'Process Queue'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {emails.length === 0 ? (
          <p className="text-muted-foreground">No pending email notifications</p>
        ) : (
          <div className="space-y-3">
            {emails.map((email) => (
              <div key={email.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{email.subject}</p>
                  <p className="text-sm text-muted-foreground">{email.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(email.created_at).toLocaleString()}
                  </p>
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
