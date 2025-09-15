import { useWeb3AuthUser } from "@web3auth/modal/react";
import { useWeb3Auth } from "@web3auth/modal/react";
import { useSolanaWallet } from "@web3auth/modal/react/solana";
import { useLocation } from "wouter";
import { Dashboard as DashboardComponent } from "@/components/dashboard/dashboard";
import { CreatePaymentWithAddress } from "@/components/payments/create-payment-with-address";
import { TemplatesModal } from "@/components/templates/templates-modal";
import { NotificationManagement } from "@/components/notifications/notification-management";
import { SubscriptionManagement } from "@/components/subscriptions/subscription-management";
import { SettingsManagement } from "@/components/settings/settings-management";
import { MerchantAddressManagement } from "@/components/merchant-addresses/merchant-address-management";
import { AnalyticsPage } from "@/pages/analytics";
import { WebSocketProvider } from "@/components/providers/websocket-provider";
import { useState, useEffect, useRef } from "react";
import { usersApi } from "@/lib/api/users";
import { type RecentPaymentsRef } from "@/components/dashboard/recent-payments";
import { MultiChainKeyService } from "@/lib/wallet/MultiChainKeyService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthUserInfo } from "@web3auth/auth";
import { useDashboardRefresh } from "@/hooks/use-dashboard-refresh";
import { analyticsApi } from "@/lib/api/analytics";
import { paymentsApi } from "@/lib/api/payments";
import { useApiCache } from "@/hooks/use-api-cache";

export default function DashboardPage() {
  const { userInfo } = useWeb3AuthUser();
  const { provider, isConnected } = useWeb3Auth();
  const { accounts } = useSolanaWallet();
  const [location, setLocation] = useLocation();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationAttempted, setRegistrationAttempted] = useState(false);
  const registrationRef = useRef(false);
  const dashboardRef = useRef<{ refreshPayments: () => void }>(null);
  const recentPaymentsRef = useRef<RecentPaymentsRef>(null);
  const { refreshKey, triggerRefresh } = useDashboardRefresh();
  
  // Get proper user ID from Web3Auth
  const getUserId = (): string => {
    if (!userInfo) return "unknown";
    
    // Cast to full type when we know properties exist
    const fullUserInfo = userInfo as AuthUserInfo;
    
    // Use email as the primary identifier for Web3Auth users for consistency
    // This ensures the same user gets the same ID across login sessions
    if (fullUserInfo.email) return fullUserInfo.email;
    if (fullUserInfo.verifierId) return fullUserInfo.verifierId;
    if (fullUserInfo.aggregateVerifier) return fullUserInfo.aggregateVerifier;
    
    return "unknown";
  };
  
  // Create cache keys for dashboard components
  const userId = getUserId();
  const metricsCacheKey = `metrics-${userId}`;
  const paymentsCacheKey = `recent-payments-${userId}`;

  // Get cache invalidation functions for dashboard components
  const { invalidateCache: invalidateMetricsCache } = useApiCache(
    metricsCacheKey,
    () => userId !== "unknown" ? analyticsApi.getMetrics(userId) : Promise.resolve({
      totalPayments: 0,
      totalRevenue: 0,
      conversionRate: '0',
      totalUsers: 0
    }),
    [userId]
  );

  const { invalidateCache: invalidatePaymentsCache } = useApiCache(
    paymentsCacheKey,
    () => userId !== "unknown" ? analyticsApi.getPaymentHistory(userId, 1, 5) : Promise.resolve([]),
    [userId]
  );

  // Generate valid ETH address from Solana address
  const generateEthAddressFallback = (solanaAddress: string) => {
    // Create a proper 40-character hex string for ETH address
    const hash = solanaAddress.slice(0, 40).toLowerCase();
    // Ensure it's exactly 40 hex characters
    const paddedHash = hash.padEnd(40, '0').slice(0, 40);
    // Replace any non-hex characters with valid hex
    const validHex = paddedHash.replace(/[^0-9a-f]/g, '0');
    return "0x" + validHex;
  };

  useEffect(() => {
    // Auto-register user if not already registered
    const autoRegisterUser = async () => {
      const userId = getUserId();
      if (!userInfo || userId === "unknown" || !isConnected || registrationRef.current || registrationAttempted) {
        return;
      }

      registrationRef.current = true;
      setIsRegistering(true);

      try {
        // Check if user exists
        const existingUser = await usersApi.getUserProfile(userId);

        if (!existingUser) {
          console.log("Auto-registering user:", userId);

          let solanaAddress = "";
          let ethereumAddress = "";

          // Use Solana wallet as primary method (more reliable)
          if (accounts?.[0]) {
            solanaAddress = accounts[0];
            ethereumAddress = generateEthAddressFallback(solanaAddress);
            console.log("Using Solana wallet addresses:", { solanaAddress, ethereumAddress });
          } else {
            console.error("No Solana wallet address available");
            return;
          }

          if (solanaAddress && ethereumAddress) {
            await usersApi.registerUser({
              web3auth_user_id: userId,
              email: userInfo.email || `${userId}@web3auth.user`,
              name: userInfo.name || '',
              solana_address: solanaAddress,
              ethereum_address: ethereumAddress,
            });

            console.log("User auto-registered successfully");
          }
        } else {
          console.log("User already exists:", existingUser.web3AuthUserId);
        }
      } catch (error) {
        console.error("Auto-registration failed:", error);
      } finally {
        setIsRegistering(false);
        setRegistrationAttempted(true);
        registrationRef.current = false;
      }
    };

    // Only run once when all conditions are met
    if (userInfo && getUserId() !== "unknown" && isConnected && accounts?.[0] && !registrationAttempted) {
      autoRegisterUser();
    }
  }, [userInfo?.email, userInfo && (userInfo as AuthUserInfo).verifierId, userInfo && (userInfo as AuthUserInfo).aggregateVerifier, isConnected, accounts?.[0], registrationAttempted]);

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (isRegistering) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your account...</p>
          <p className="text-sm text-gray-500 mt-2">Registering wallet addresses...</p>
        </div>
      </div>
    );
  }

  // User object to match the expected interface
  const user = {
    first_name: userInfo.name?.split(' ')[0] || "User",
    web3auth_user_id: getUserId(),
  };

  const handleCreatePayment = () => {
    setIsPaymentModalOpen(true);
  };

  const handleViewTemplates = () => {
    setIsTemplatesModalOpen(true);
  };

  const handleViewWallets = () => {
    setLocation('/wallets');
  };

  const handlePaymentCreated = (payment: any) => {
    console.log('Payment created:', payment);
    
    // Invalidate caches to force refresh of dashboard components
    invalidateMetricsCache();
    invalidatePaymentsCache();
    
    // Trigger refresh of dashboard components
    triggerRefresh();
    
    // Also use the ref to refresh recent payments specifically
    if (recentPaymentsRef.current) {
      recentPaymentsRef.current.refresh();
    }
  };

  // Show analytics page if requested
  if (showAnalytics) {
    return (
      <AnalyticsPage
        onBack={() => setShowAnalytics(false)}
        userId={user.web3auth_user_id}
      />
    );
  }

  return (
    <WebSocketProvider userId={getUserId()}>
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
              <TabsTrigger value="dashboard" className="text-xs md:text-sm">Dashboard</TabsTrigger>
              <TabsTrigger value="subscriptions" className="text-xs md:text-sm">Subscriptions</TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs md:text-sm">Notifications</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs md:text-sm">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              <DashboardComponent
                key={refreshKey} // This will force re-render of dashboard components
                user={user}
                onCreatePayment={handleCreatePayment}
                onViewTemplates={handleViewTemplates}
                onViewWallets={handleViewWallets}
                onViewAnalytics={() => setShowAnalytics(true)}
                onPaymentCreated={handlePaymentCreated}
              />
            </TabsContent>

            <TabsContent value="subscriptions" className="mt-6">
              <SubscriptionManagement userId={user.web3auth_user_id} />
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
              <NotificationManagement userId={user.web3auth_user_id} />
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <div className="space-y-6">
                <SettingsManagement userId={user.web3auth_user_id} />
                <MerchantAddressManagement userId={user.web3auth_user_id} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <CreatePaymentWithAddress
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentCreated={handlePaymentCreated}
          userId={user.web3auth_user_id}
          userWalletAddress={accounts?.[0] || undefined}
        />

        <TemplatesModal
          isOpen={isTemplatesModalOpen}
          onClose={() => setIsTemplatesModalOpen(false)}
          userId={user.web3auth_user_id}
        />
      </div>
    </WebSocketProvider>
  );
}
