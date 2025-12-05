import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import PolicyHolderLayout from "./components/PolicyHolderLayout";
import PolicyHolderDashboard from "./pages/PolicyHolderDashboard";
import PolicyHolderSubmitClaim from "./pages/PolicyHolderSubmitClaim";
import WorkerLayout from "./components/WorkerLayout";
import WorkerDashboardNew from "./pages/WorkerDashboardNew";
import WorkerClaimReview from "./pages/WorkerClaimReview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/policy-holder" element={<PolicyHolderLayout />}>
            <Route path="dashboard" element={<PolicyHolderDashboard />} />
            <Route path="submit-claim" element={<PolicyHolderSubmitClaim />} />
          </Route>
          
          <Route path="/worker" element={<WorkerLayout />}>
            <Route path="dashboard" element={<WorkerDashboardNew />} />
            <Route path="review/:claimId" element={<WorkerClaimReview />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
