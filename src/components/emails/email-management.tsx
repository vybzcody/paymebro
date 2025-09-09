import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [sendingTest, setSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState('');
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
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
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
          email: testEmail,
          userId: userId,
        }),
      });

      if (response.ok) {
        toast({
          title: "Test Email Sent",
          description: `Test email queued for ${testEmail}`,
        });
        setTestEmail(''); // Clear input
        fetchEmails();
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

  if (loading) {
    return <div>Loading email notifications...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Email Notifications
          <Button onClick={processEmails} disabled={processing} size="sm">
            {processing ? 'Processing...' : 'Process Queue'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Test Email Section */}
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
              className="flex-1"
            />
            <Button 
              onClick={sendTestEmail} 
              disabled={sendingTest || !testEmail}
              size="sm"
            >
              {sendingTest ? 'Sending...' : 'Send Test'}
            </Button>
          </div>
        </div>

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
