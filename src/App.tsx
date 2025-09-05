import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import RoleSelection from "./pages/RoleSelection";
import PatientOnboarding from "./pages/onboarding/PatientOnboarding";
import ProviderOnboarding from "./pages/onboarding/ProviderOnboarding";
import PatientDashboard from "./pages/dashboard/PatientDashboard";
// import ProviderDashboard from "./pages/dashboard/ProviderDashboard";
import HealthInsights from "./pages/HealthInsights";
import AuditTrail from "./pages/AuditTrail";
import MedicationManager from "./pages/MedicationManager";
import HealthTimeline from "./pages/HealthTimeline";
import FamilyHealthHub from "./pages/FamilyHealthHub";
import ProviderDashboard from "./pages/ProviderDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/select-role" element={<RoleSelection />} />
          <Route path="/onboarding/patient" element={<PatientOnboarding />} />
          <Route path="/onboarding/provider" element={<ProviderOnboarding />} />
          <Route path="/dashboard/patient" element={<PatientDashboard />} />
          <Route path="/dashboard/provider" element={<ProviderDashboard />} />
          <Route path="/health-insights" element={<HealthInsights />} />
          <Route path="/audit-trail" element={<AuditTrail />} />
          <Route path="/medication-manager" element={<MedicationManager />} />
          <Route path="/health-timeline" element={<HealthTimeline />} />
          <Route path="/family-health-hub" element={<FamilyHealthHub />} />
          <Route path="/provider-dashboard" element={<ProviderDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
