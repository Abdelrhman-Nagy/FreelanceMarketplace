import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router, Route, Switch } from 'wouter';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/Header';
import HomePage from '@/pages/HomePage';
import JobsPage from '@/pages/JobsPage';
import DashboardPage from '@/pages/DashboardPage';
import JobDetailPage from '@/pages/JobDetailPage';
import { Toaster } from '@/components/ui/toaster';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="freelancing-theme">
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Router>
              <Switch>
                <Route path="/" component={HomePage} />
                <Route path="/jobs" component={JobsPage} />
                <Route path="/jobs/:id" component={JobDetailPage} />
                <Route path="/dashboard" component={DashboardPage} />
                <Route>
                  <div className="text-center py-20">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                      404 - Page Not Found
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      The page you're looking for doesn't exist.
                    </p>
                  </div>
                </Route>
              </Switch>
            </Router>
          </main>
          <Toaster />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;