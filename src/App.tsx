import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Web3AuthProvider } from './contexts/Web3AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { useAuth } from './hooks/useAuth';
import { Suspense, lazy } from 'react';

// Lazy load pages for better performance
const Landing = lazy(() => import("./pages/Landing"));
const Index = lazy(() => import("./pages/Index"));
const PaymentLinks = lazy(() => import("./pages/PaymentLinks"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Invoices = lazy(() => import("./pages/Invoices"));
const Notifications = lazy(() => import("./pages/Notifications"));
const QRCodes = lazy(() => import("./pages/QRCodes"));
const RealtimeNotifications = lazy(() => import("./components/RealtimeNotifications"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const Help = lazy(() => import("./pages/Help"));
const Customers = lazy(() => import("./pages/Customers"));
const Profile = lazy(() => import("./pages/Profile"));
const Billing = lazy(() => import("./pages/Billing"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Multi-chain components
const UniversalPaymentPage = lazy(() => import("./components/UniversalPaymentPage"));

// Components
import { Layout } from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import { BackendTestComponent } from './components/BackendTestComponent';
import { MultiChainProvider } from './contexts/MultiChainContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always consider data stale for real-time updates
      refetchOnWindowFocus: true, // Refetch when tab becomes active
      refetchOnMount: true, // Always refetch on component mount
      retry: 1,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner text="Connecting to your wallet..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
};

// App Routes Component (needs to be inside Web3AuthProvider)
const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading..." />}>
      <Routes>
        {/* Public Routes - Landing page is now default */}
        <Route path="/" element={<Landing />} />
        
        {/* Universal Payment Route - Public */}
        <Route path="/pay/:paymentId" element={<UniversalPaymentPage />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        } />

        <Route path="/payment-links" element={
          <ProtectedRoute>
            <PaymentLinks />
          </ProtectedRoute>
        } />

        <Route path="/transactions" element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        } />

        <Route path="/qr-codes" element={
          <ProtectedRoute>
            <QRCodes />
          </ProtectedRoute>
        } />

        <Route path="/invoices" element={
          <ProtectedRoute>
            <Invoices />
          </ProtectedRoute>
        } />

        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />

        <Route path="/analytics" element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } />

        <Route path="/customers" element={
          <ProtectedRoute>
            <Customers />
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />

        <Route path="/billing" element={
          <ProtectedRoute>
            <Billing />
          </ProtectedRoute>
        } />

        <Route path="/help" element={
          <ProtectedRoute>
            <Help />
          </ProtectedRoute>
        } />

        {/* Backend Test Route - Development Only */}
        <Route path="/test-backend" element={
          <ProtectedRoute>
            <BackendTestComponent />
          </ProtectedRoute>
        } />

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Web3AuthProvider>
      <MultiChainProvider>
        <CurrencyProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen bg-background">
                <AppRoutes />
                <Suspense fallback={null}>
                  <RealtimeNotifications />
                </Suspense>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </CurrencyProvider>
      </MultiChainProvider>
    </Web3AuthProvider>
  </QueryClientProvider>
);

export default App;
