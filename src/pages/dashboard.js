import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    const dashboardRef = useRef(null);
    // Get proper user ID from Web3Auth
    const getUserId = () => {
        if (!userInfo)
            return "unknown";
        // Simple type checking
        if (userInfo.verifierId && typeof userInfo.verifierId === 'string')
            return userInfo.verifierId;
        if (userInfo.aggregateVerifier && typeof userInfo.aggregateVerifier === 'string')
            return userInfo.aggregateVerifier;
        if (userInfo.email && typeof userInfo.email === 'string')
            return userInfo.email;
        return "unknown";
    };
    // Generate valid ETH address from Solana address
    const generateEthAddressFallback = (solanaAddress) => {
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
                    }
                    else {
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
                }
                else {
                    console.log("User already exists:", existingUser.web3AuthUserId);
                }
            }
            catch (error) {
                console.error("Auto-registration failed:", error);
            }
            finally {
                setIsRegistering(false);
                setRegistrationAttempted(true);
                registrationRef.current = false;
            }
        };
        // Only run once when all conditions are met
        if (userInfo && getUserId() !== "unknown" && isConnected && accounts?.[0] && !registrationAttempted) {
            autoRegisterUser();
        }
    }, [userInfo && hasVerifierId(userInfo) ? userInfo.verifierId : undefined, userInfo && hasAggregateVerifier(userInfo) ? userInfo.aggregateVerifier : undefined, userInfo?.email, isConnected, accounts?.[0], registrationAttempted, getUserId()]);
    if (!userInfo) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading dashboard..." })] }) }));
    }
    if (isRegistering) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Setting up your account..." }), _jsx("p", { className: "text-sm text-gray-500 mt-2", children: "Registering wallet addresses..." })] }) }));
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
    // Show analytics page if requested
    if (showAnalytics) {
        return (_jsx(AnalyticsPage, { onBack: () => setShowAnalytics(false), userId: user.web3auth_user_id }));
    }
    return (_jsx(WebSocketProvider, { userId: getUserId(), children: _jsxs("div", { className: "bg-white", children: [_jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: _jsxs(Tabs, { defaultValue: "dashboard", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2 md:grid-cols-4 h-auto", children: [_jsx(TabsTrigger, { value: "dashboard", className: "text-xs md:text-sm", children: "Dashboard" }), _jsx(TabsTrigger, { value: "subscriptions", className: "text-xs md:text-sm", children: "Subscriptions" }), _jsx(TabsTrigger, { value: "notifications", className: "text-xs md:text-sm", children: "Notifications" }), _jsx(TabsTrigger, { value: "settings", className: "text-xs md:text-sm", children: "Settings" })] }), _jsx(TabsContent, { value: "dashboard", className: "mt-6", children: _jsx(DashboardComponent, { user: user, onCreatePayment: handleCreatePayment, onViewTemplates: handleViewTemplates, onViewWallets: handleViewWallets, onViewAnalytics: () => setShowAnalytics(true) }) }), _jsx(TabsContent, { value: "subscriptions", className: "mt-6", children: _jsx(SubscriptionManagement, { userId: user.web3auth_user_id }) }), _jsx(TabsContent, { value: "notifications", className: "mt-6", children: _jsx(NotificationManagement, { userId: user.web3auth_user_id }) }), _jsx(TabsContent, { value: "settings", className: "mt-6", children: _jsxs("div", { className: "space-y-6", children: [_jsx(SettingsManagement, { userId: user.web3auth_user_id }), _jsx(MerchantAddressManagement, { userId: user.web3auth_user_id })] }) })] }) }), _jsx(CreatePaymentWithAddress, { isOpen: isPaymentModalOpen, onClose: () => setIsPaymentModalOpen(false), onPaymentCreated: (payment) => {
                        console.log('Payment created:', payment);
                        // You can add additional logic here like showing a success modal
                    }, userId: user.web3auth_user_id, userWalletAddress: accounts?.[0] || undefined }), _jsx(TemplatesModal, { isOpen: isTemplatesModalOpen, onClose: () => setIsTemplatesModalOpen(false), userId: user.web3auth_user_id })] }) }));
}
