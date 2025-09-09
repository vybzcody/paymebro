import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { webhooksApi, Webhook, CreateWebhookRequest } from '@/lib/api/webhooks';
import { useToast } from '@/hooks/use-toast';

interface WebhookConfigProps {
  userId: string;
}

const AVAILABLE_EVENTS = [
  'payment.confirmed',
  'payment.failed',
  'subscription.created',
  'subscription.cancelled',
  'subscription.renewed',
];

export function WebhookConfig({ userId }: WebhookConfigProps) {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();

  const [newWebhook, setNewWebhook] = useState<CreateWebhookRequest>({
    url: '',
    events: [],
  });

  const fetchWebhooks = async () => {
    try {
      const fetchedWebhooks = await webhooksApi.getWebhooks(userId);
      setWebhooks(fetchedWebhooks);
    } catch (error) {
      console.error('Failed to fetch webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWebhook = async () => {
    if (!newWebhook.url || newWebhook.events.length === 0) {
      toast({
        title: "Error",
        description: "URL and at least one event are required",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      await webhooksApi.createWebhook(newWebhook, userId);
      toast({
        title: "Webhook Created",
        description: "Webhook endpoint created successfully",
      });
      setNewWebhook({ url: '', events: [] });
      setShowCreateForm(false);
      fetchWebhooks();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create webhook",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      await webhooksApi.deleteWebhook(webhookId, userId);
      toast({
        title: "Webhook Deleted",
        description: "Webhook endpoint deleted successfully",
      });
      fetchWebhooks();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete webhook",
        variant: "destructive",
      });
    }
  };

  const handleTestWebhook = async (webhookId: string) => {
    try {
      await webhooksApi.testWebhook(webhookId, userId);
      toast({
        title: "Test Sent",
        description: "Test webhook sent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test webhook",
        variant: "destructive",
      });
    }
  };

  const handleEventToggle = (event: string, checked: boolean) => {
    if (checked) {
      setNewWebhook({ ...newWebhook, events: [...newWebhook.events, event] });
    } else {
      setNewWebhook({ ...newWebhook, events: newWebhook.events.filter(e => e !== event) });
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, [userId]);

  if (loading) {
    return <div>Loading webhooks...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Webhook Endpoints
          <Button onClick={() => setShowCreateForm(!showCreateForm)} size="sm">
            {showCreateForm ? 'Cancel' : 'Add Webhook'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showCreateForm && (
          <div className="mb-6 p-4 border rounded-lg space-y-4">
            <div>
              <Label htmlFor="url">Webhook URL</Label>
              <Input
                id="url"
                type="url"
                value={newWebhook.url}
                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                placeholder="https://your-app.com/webhook"
              />
            </div>

            <div>
              <Label>Events to Subscribe</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {AVAILABLE_EVENTS.map((event) => (
                  <div key={event} className="flex items-center space-x-2">
                    <Checkbox
                      id={event}
                      checked={newWebhook.events.includes(event)}
                      onCheckedChange={(checked) => handleEventToggle(event, checked as boolean)}
                    />
                    <Label htmlFor={event} className="text-sm">{event}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleCreateWebhook} disabled={creating} className="w-full">
              {creating ? 'Creating...' : 'Create Webhook'}
            </Button>
          </div>
        )}

        {webhooks.length === 0 ? (
          <p className="text-muted-foreground">No webhook endpoints configured</p>
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium break-all">{webhook.url}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {webhook.events.map((event) => (
                      <Badge key={event} variant="outline" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created: {new Date(webhook.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    onClick={() => handleTestWebhook(webhook.id)}
                    variant="outline"
                    size="sm"
                  >
                    Test
                  </Button>
                  <Button
                    onClick={() => handleDeleteWebhook(webhook.id)}
                    variant="destructive"
                    size="sm"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
