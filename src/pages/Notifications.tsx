import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Layout } from "@/components/Layout";
import {
  Bell,
  Check,
  X,
  Filter,
  Search,
  Settings,
  Trash2,
  MoreHorizontal,
  CreditCard,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  DollarSign,
  Users,
  Shield,
  Zap,
  Calendar,
  Mail,
  Smartphone
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: 'payment' | 'security' | 'system' | 'marketing' | 'invoice';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  metadata?: Record<string, any>;
}

const Notifications = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'unread' | 'payment' | 'security' | 'system'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'payment',
      title: 'Payment Received',
      message: 'You received a payment of $125.50 USDC from John Doe',
      timestamp: '2 minutes ago',
      read: false,
      priority: 'high',
      metadata: { amount: '$125.50', customer: 'John Doe', paymentId: 'PMT001' }
    },
    {
      id: '2',
      type: 'security',
      title: 'New Login Detected',
      message: 'A new login was detected from Chrome on MacBook Pro in Lagos, Nigeria',
      timestamp: '15 minutes ago',
      read: false,
      priority: 'medium',
      metadata: { device: 'MacBook Pro', location: 'Lagos, Nigeria' }
    },
    {
      id: '3',
      type: 'invoice',
      title: 'Invoice Paid',
      message: 'Invoice INV-002 has been paid by Sarah Wilson',
      timestamp: '1 hour ago',
      read: true,
      priority: 'medium',
      metadata: { invoiceId: 'INV-002', customer: 'Sarah Wilson', amount: '$89.25' }
    },
    {
      id: '4',
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM WAT',
      timestamp: '3 hours ago',
      read: true,
      priority: 'low',
      metadata: { startTime: '2:00 AM WAT', endTime: '4:00 AM WAT' }
    },
    {
      id: '5',
      type: 'payment',
      title: 'Payment Failed',
      message: 'Payment attempt of $67.80 USDC from Grace Mbeki failed',
      timestamp: '5 hours ago',
      read: false,
      priority: 'urgent',
      metadata: { amount: '$67.80', customer: 'Grace Mbeki', reason: 'Insufficient funds' }
    },
    {
      id: '6',
      type: 'security',
      title: 'Password Changed',
      message: 'Your account password was successfully changed',
      timestamp: '1 day ago',
      read: true,
      priority: 'medium'
    },
    {
      id: '7',
      type: 'marketing',
      title: 'New Feature Available',
      message: 'Try our new analytics dashboard with advanced reporting features',
      timestamp: '2 days ago',
      read: true,
      priority: 'low'
    },
    {
      id: '8',
      type: 'payment',
      title: 'Large Payment Alert',
      message: 'You received a large payment of $1,250.00 USDC from ABC Corp',
      timestamp: '3 days ago',
      read: true,
      priority: 'high',
      metadata: { amount: '$1,250.00', customer: 'ABC Corp', paymentId: 'PMT005' }
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    paymentAlerts: true,
    securityAlerts: true,
    systemUpdates: true,
    marketingEmails: false
  });

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = priority === 'urgent' ? 'text-destructive' :
      priority === 'high' ? 'text-accent' :
        priority === 'medium' ? 'text-primary' : 'text-muted-foreground';

    switch (type) {
      case 'payment':
        return <CreditCard className={`w-5 h-5 ${iconClass}`} />;
      case 'security':
        return <Shield className={`w-5 h-5 ${iconClass}`} />;
      case 'system':
        return <Settings className={`w-5 h-5 ${iconClass}`} />;
      case 'marketing':
        return <Zap className={`w-5 h-5 ${iconClass}`} />;
      case 'invoice':
        return <DollarSign className={`w-5 h-5 ${iconClass}`} />;
      default:
        return <Bell className={`w-5 h-5 ${iconClass}`} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'high': return 'bg-accent/10 text-accent border-accent/20';
      case 'medium': return 'bg-primary/10 text-primary border-primary/20';
      case 'low': return 'bg-muted text-muted-foreground border-muted';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' ||
      (filter === 'unread' && !notification.read) ||
      notification.type === filter;

    const matchesSearch = searchTerm === '' ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({
      title: "All notifications marked as read",
      description: `${unreadCount} notifications marked as read`,
    });
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast({
      title: "Notification deleted",
      description: "The notification has been removed",
    });
  };

  const handleBulkAction = (action: 'read' | 'delete') => {
    if (action === 'read') {
      setNotifications(prev =>
        prev.map(n => selectedNotifications.includes(n.id) ? { ...n, read: true } : n)
      );
      toast({
        title: "Notifications marked as read",
        description: `${selectedNotifications.length} notifications marked as read`,
      });
    } else if (action === 'delete') {
      setNotifications(prev =>
        prev.filter(n => !selectedNotifications.includes(n.id))
      );
      toast({
        title: "Notifications deleted",
        description: `${selectedNotifications.length} notifications deleted`,
      });
    }
    setSelectedNotifications([]);
  };

  const toggleNotificationSelection = (id: string) => {
    setSelectedNotifications(prev =>
      prev.includes(id) ? prev.filter(nId => nId !== id) : [...prev, id]
    );
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings Updated",
      description: "Your notification preferences have been saved",
    });
  };

  return (
    <div>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 opacity-0 animate-fade-in-down">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <Badge className="bg-destructive text-destructive-foreground">
                  {unreadCount} new
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">Stay updated with your account activity and system alerts</p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={handleMarkAllAsRead} className="gap-2 btn-press">
                <Check className="w-4 h-4" />
                Mark All Read
              </Button>
            )}
            {selectedNotifications.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('read')} className="btn-press">
                  <Check className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('delete')} className="btn-press">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Notifications */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filters */}
            <div className="opacity-0 animate-fade-in-up animate-delay-100">
              <Card className="card-hover">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                      >
                        <option value="all">All Notifications</option>
                        <option value="unread">Unread Only</option>
                        <option value="payment">Payments</option>
                        <option value="security">Security</option>
                        <option value="system">System</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notifications List */}
            <div className="space-y-3 opacity-0 animate-fade-in-up animate-delay-200">
              {filteredNotifications.length === 0 ? (
                <Card className="card-hover">
                  <CardContent className="p-8 text-center">
                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No notifications found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? "Try adjusting your search terms" : "You're all caught up!"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map((notification, index) => (
                  <Card
                    key={notification.id}
                    className={`card-hover transition-all duration-200 opacity-0 animate-fade-in-up ${!notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
                      }`}
                    style={{ animationDelay: `${300 + index * 50}ms` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => toggleNotificationSelection(notification.id)}
                          className="mt-1"
                        />

                        <div className="p-2 bg-muted/50 rounded-lg">
                          {getNotificationIcon(notification.type, notification.priority)}
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className={`font-semibold ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                                {notification.priority}
                              </Badge>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {notification.timestamp}
                              </span>
                            </div>
                          </div>

                          {notification.metadata && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {Object.entries(notification.metadata).map(([key, value]) => (
                                <Badge key={key} variant="secondary" className="text-xs">
                                  {key}: {value}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="btn-press"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Mark as read
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="btn-press text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                            {notification.actionUrl && (
                              <Button variant="ghost" size="sm" className="btn-press">
                                View Details
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Notification Settings Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="opacity-0 animate-slide-in-right animate-delay-100">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="text-lg">Notification Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Total</span>
                    <span className="font-semibold">{notifications.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Unread</span>
                    <span className="font-semibold text-destructive">{unreadCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Today</span>
                    <span className="font-semibold">
                      {notifications.filter(n => n.timestamp.includes('minutes ago') || n.timestamp.includes('hour')).length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notification Settings */}
            <div className="opacity-0 animate-slide-in-right animate-delay-200">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">Email</span>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      <span className="text-sm">Push</span>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      <span className="text-sm">SMS</span>
                    </div>
                    <Switch
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Categories</h4>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Payment Alerts</span>
                      <Switch
                        checked={notificationSettings.paymentAlerts}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, paymentAlerts: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Security Alerts</span>
                      <Switch
                        checked={notificationSettings.securityAlerts}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, securityAlerts: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">System Updates</span>
                      <Switch
                        checked={notificationSettings.systemUpdates}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, systemUpdates: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Marketing</span>
                      <Switch
                        checked={notificationSettings.marketingEmails}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, marketingEmails: checked }))
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveSettings} className="w-full btn-press">
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="opacity-0 animate-slide-in-right animate-delay-300">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start btn-press">
                    <Check className="w-4 h-4 mr-2" />
                    Mark All Read
                  </Button>
                  <Button variant="outline" className="w-full justify-start btn-press">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                  <Button variant="outline" className="w-full justify-start btn-press">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
