
import { Router, Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/toaster';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import FreelancerDashboard from './pages/FreelancerDashboard';
import ProfilePage from './pages/ProfilePage';
import ContractsPage from './pages/ContractsPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import SavedJobsPage from './pages/SavedJobsPage';
import ProposalsPage from './pages/ProposalsPage';
import ClientProposalsPage from './pages/ClientProposalsPage';
import { AuthProvider } from './contexts/AuthContext';
import { queryClient } from './lib/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Navigation />
              <main className="container mx-auto px-4 py-8">
                <Switch>
                  <Route path="/" component={HomePage} />
                  <Route path="/jobs" component={JobsPage} />
                  <Route path="/jobs/:id" component={JobDetailPage} />
                  <Route path="/dashboard" component={DashboardPage} />
                  <Route path="/login" component={LoginPage} />
                  <Route path="/register" component={RegisterPage} />
                  <Route path="/forgot-password" component={ForgotPasswordPage} />
                  <Route path="/reset-password" component={ResetPasswordPage} />
                  <Route path="/admin" component={AdminDashboard} />
                  <Route path="/client-dashboard" component={ClientDashboard} />
                  <Route path="/freelancer-dashboard" component={FreelancerDashboard} />
                  <Route path="/profile" component={ProfilePage} />
                  <Route path="/contracts" component={ContractsPage} />
                  <Route path="/projects" component={ProjectsPage} />
                  <Route path="/projects/:id" component={ProjectDetailPage} />
                  <Route path="/saved-jobs" component={SavedJobsPage} />
                  <Route path="/proposals" component={ProposalsPage} />
                  <Route path="/jobs/:jobId/proposals" component={ClientProposalsPage} />
                  <Route>
                    <div className="text-center py-20">
                      <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
                      <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
                    </div>
                  </Route>
                </Switch>
              </main>
            </div>
          </Router>
        </AuthProvider>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;