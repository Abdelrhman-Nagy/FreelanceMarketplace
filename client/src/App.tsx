import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import BrowseJobs from "@/pages/browse-jobs";
import Dashboard from "@/pages/dashboard";
import JobDetail from "@/pages/job-detail";
import AdminDashboard from "@/pages/admin-dashboard";
import Messages from "@/pages/messages";
import Contracts from "@/pages/contracts";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/browse-jobs" component={BrowseJobs} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/contracts" component={Contracts} />
          <Route path="/messages" component={Messages} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/jobs/:id" component={JobDetail} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
