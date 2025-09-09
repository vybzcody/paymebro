import { useWeb3AuthUser } from "@web3auth/modal/react";
import { useWeb3Auth } from "@web3auth/modal/react";
import { useSolanaWallet } from "@web3auth/modal/react/solana";
import { useLocation } from "wouter";
import { Dashboard as DashboardComponent } from "@/components/dashboard/dashboard";
import { CreatePaymentModal } from "@/components/payments/create-payment-modal";
import { TemplatesModal } from "@/components/templates/templates-modal";
import { EmailManagement } from "@/components/emails/email-management";
import { useState, useEffect, useRef } from "react";
import { usersApi } from "@/lib/api/users";
import { MultiChainKeyService } from "@/lib/wallet/MultiChainKeyService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  const { userInfo } = useWeb3AuthUser();
  const { provider, isConnected } = useWeb3Auth();
  const { accounts } = useSolanaWallet();
  const [location, setLocation] = useLocation();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationAttempted, setRegistrationAttempted] = useState(false);
  const registrationRef = useRef(false);

  // Get proper user ID from Web3Auth
  const getUserId = () => {
    if (!userInfo) return "unknown";
    return userInfo.verifierId || userInfo.aggregateVerifier || userInfo.email || "unknown";
  };

  const userId = getUserId();

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
              web3AuthUserId: userId,
              email: userInfo.email || `${userId}@web3auth.user`,
              solanaAddress,
              ethereumAddress,
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
    if (userInfo && userId !== "unknown" && isConnected && accounts?.[0] && !registrationAttempted) {
      autoRegisterUser();
    }
  }, [userInfo, userId, isConnected, accounts, registrationAttempted]);

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
    web3auth_user_id: userId,
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

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="emails">Email Management</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-6">
            <DashboardComponent
              user={user}
              onCreatePayment={handleCreatePayment}
              onViewTemplates={handleViewTemplates}
              onViewWallets={handleViewWallets}
            />
          </TabsContent>
          
          <TabsContent value="emails" className="mt-6">
            <EmailManagement userId={user.web3auth_user_id} />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Settings panel coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CreatePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        userId={user.web3auth_user_id}
      />

      <TemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        userId={user.web3auth_user_id}
      />
    </div>
  );
}
