import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Mail, Send, Clock, CheckCircle, XCircle } from "lucide-react";

interface Notification {
  id: string;
  type: 'invoice' | 'confirmation' | 'reminder';
  email: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
  sent_at?: string;
}

interface NotificationManagementProps {
  userId: string;
}

export function NotificationManagement({ userId }: NotificationManagementProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/notifications/user/${userId}`);
      const result = await response.json();
      if (result.success) {
        setNotifications(result.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processNotifications = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/notifications/process', {
        method: 'POST',
        headers: { 'x-user-id': userId }
      });
      const result = await response.json();
      if (result.success) {
        fetchNotifications(); // Refresh list
      }
    } catch (error) {
      console.error('Failed to process notifications:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Mail className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
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
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Notification Management
        </CardTitle>
        <Button onClick={processNotifications} size="sm">
          <Send className="h-4 w-4 mr-2" />
          Process Pending
        </Button>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No notifications found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(notification.status)}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getTypeColor(notification.type)}>
                        {notification.type}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        to {notification.email}
                      </span>
                    </div>
                    <p className="font-medium">{notification.subject}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(notification.created_at).toLocaleDateString()}
                      {notification.sent_at && (
                        <span> • Sent {new Date(notification.sent_at).toLocaleDateString()}</span>
                      )}
                    </p>
                  </div>
                </div>
                <Badge variant={notification.status === 'sent' ? 'default' : 'secondary'}>
                  {notification.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
