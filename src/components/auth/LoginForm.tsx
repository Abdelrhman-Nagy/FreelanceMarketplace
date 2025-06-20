import React, { useState } from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoRole: UserRole) => {
    const demoCredentials = {
      admin: { email: 'admin@demo.com', password: 'admin123' },
      client: { email: 'client@demo.com', password: 'client123' },
      freelancer: { email: 'freelancer@demo.com', password: 'freelancer123' }
    };

    const credentials = demoCredentials[demoRole];
    setEmail(credentials.email);
    setPassword(credentials.password);
    
    try {
      setLoading(true);
      await login(credentials.email, credentials.password);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login to FreelancingPlatform</CardTitle>
        <CardDescription>
          Access your dashboard and manage your freelancing journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>
        </form>

        <div className="mt-4 text-center">
          <a 
            href="/forgot-password" 
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Forgot your password?
          </a>
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-sm text-gray-600 text-center">Demo Accounts:</p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>Admin: admin@demo.com / admin123</div>
            <div>Client: client@demo.com / client123</div>
            <div>Freelancer: freelancer@demo.com / freelancer123</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
            >
              Admin Demo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin('client')}
              disabled={loading}
            >
              Client Demo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin('freelancer')}
              disabled={loading}
            >
              Freelancer Demo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};