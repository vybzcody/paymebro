import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";
import {
  User,
  Wallet,
  Bell,
  Shield,
  Globe,
  Smartphone,
  Mail,
  Key,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false
  });
  const { toast } = useToast();

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText("afp_live_sk_1234567890abcdef");
    toast({
      title: "API Key Copied",
      description: "Your API key has been copied to clipboard",
    });
  };

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile settings have been saved successfully",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved",
    });
  };

  return (
    <div>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="opacity-0 animate-fade-in-down">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="opacity-0 animate-slide-in-left animate-delay-100">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Doe" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business">Business Name</Label>
                    <Input id="business" defaultValue="John's Electronics Store" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue="+234 801 234 5678" />
                  </div>
                  <Button onClick={handleSaveProfile} className="btn-press">Save Profile</Button>
                </CardContent>
              </Card>
            </div>

            {/* Wallet Settings */}
            <div className="opacity-0 animate-slide-in-left animate-delay-200">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Wallet Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Primary Wallet Address</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button variant="outline" size="sm" className="btn-press">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-confirm payments</p>
                      <p className="text-sm text-muted-foreground">Automatically confirm payments under $100</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Multi-signature required</p>
                      <p className="text-sm text-muted-foreground">Require multiple signatures for large transactions</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* API Settings */}
            <div className="opacity-0 animate-slide-in-left animate-delay-300">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    API Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value="afp_live_sk_1234567890abcdef"
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="btn-press"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCopyApiKey} className="btn-press">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <Input placeholder="https://yoursite.com/webhook" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Test mode</p>
                      <p className="text-sm text-muted-foreground">Use test network for transactions</p>
                    </div>
                    <Switch />
                  </div>
                  <Button variant="outline" className="btn-press">Regenerate API Key</Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="opacity-0 animate-slide-in-right animate-delay-100">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Verification Status</span>
                    <Badge className="bg-primary/10 text-primary">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Account Type</span>
                    <Badge variant="secondary">Business</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monthly Limit</span>
                    <span className="text-sm font-medium">$50,000</span>
                  </div>
                  <Separator />
                  <Button variant="outline" className="w-full btn-press">
                    Upgrade Account
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Notification Settings */}
            <div className="opacity-0 animate-slide-in-right animate-delay-200">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">Email notifications</span>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, email: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      <span className="text-sm">SMS notifications</span>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, sms: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      <span className="text-sm">Push notifications</span>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, push: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span className="text-sm">Marketing emails</span>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, marketing: checked }))
                      }
                    />
                  </div>
                  <Button onClick={handleSaveNotifications} className="w-full btn-press">
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Security */}
            <div className="opacity-0 animate-slide-in-right animate-delay-300">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full btn-press">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full btn-press">
                    Enable 2FA
                  </Button>
                  <Button variant="outline" className="w-full btn-press">
                    Download Backup Codes
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

export default Settings;
