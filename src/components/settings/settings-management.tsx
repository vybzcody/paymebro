import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { User, Bell, Wallet, Save } from "lucide-react";

interface UserProfile {
  web3AuthUserId: string;
  email: string;
  name?: string;
  businessName?: string;
  businessType?: string;
  solanaAddress?: string;
  ethereumAddress?: string;
  onboardingCompleted: boolean;
}

interface SettingsManagementProps {
  userId: string;
}

export function SettingsManagement({ userId }: SettingsManagementProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    paymentConfirmations: true,
    invoiceReminders: true,
    subscriptionUpdates: true
  });

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/users/profile/${userId}`);
      const result = await response.json();
      if (result.success) {
        setProfile(result.user);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`http://localhost:3000/api/users/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          businessName: profile.businessName,
          businessType: profile.businessType
        })
      });

      if (response.ok) {
        // Success feedback could be added here
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Unable to load profile settings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={profile.businessName || ''}
                onChange={(e) => setProfile(prev => prev ? { ...prev, businessName: e.target.value } : null)}
                placeholder="Your Business Name"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="businessType">Business Type</Label>
            <Input
              id="businessType"
              value={profile.businessType || ''}
              onChange={(e) => setProfile(prev => prev ? { ...prev, businessType: e.target.value } : null)}
              placeholder="e.g., E-commerce, Services, SaaS"
            />
          </div>

          <Button onClick={saveProfile} disabled={isSaving} className="w-full md:w-auto">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardContent>
      </Card>

      {/* Wallet Addresses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Addresses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="solanaAddress">Solana Address</Label>
            <Input
              id="solanaAddress"
              value={profile.solanaAddress || ''}
              disabled
              className="bg-gray-50 font-mono text-sm"
            />
          </div>
          <div>
            <Label htmlFor="ethereumAddress">Ethereum Address</Label>
            <Input
              id="ethereumAddress"
              value={profile.ethereumAddress || ''}
              disabled
              className="bg-gray-50 font-mono text-sm"
            />
          </div>
          <p className="text-xs text-gray-500">
            Wallet addresses are set during registration and cannot be changed
          </p>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="paymentConfirmations">Payment Confirmations</Label>
              <p className="text-sm text-gray-500">Get notified when payments are confirmed</p>
            </div>
            <Switch
              id="paymentConfirmations"
              checked={notifications.paymentConfirmations}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, paymentConfirmations: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="invoiceReminders">Invoice Reminders</Label>
              <p className="text-sm text-gray-500">Send reminders for unpaid invoices</p>
            </div>
            <Switch
              id="invoiceReminders"
              checked={notifications.invoiceReminders}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, invoiceReminders: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="subscriptionUpdates">Subscription Updates</Label>
              <p className="text-sm text-gray-500">Get notified about subscription changes</p>
            </div>
            <Switch
              id="subscriptionUpdates"
              checked={notifications.subscriptionUpdates}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, subscriptionUpdates: checked }))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
