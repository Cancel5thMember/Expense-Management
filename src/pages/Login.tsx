import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      toast.success('Welcome back!');
      const storedUser = localStorage.getItem('user');
      const role = storedUser ? JSON.parse(storedUser).role : 'employee';
      navigate(`/${role}`);
    } catch (error) {
      toast.error('Failed to login');
    }
  };

  return (
    <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground font-sans">
            Sign in to your ExpenseFlow account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-sans">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background/50 border-border focus:border-[hsl(var(--accent-purple))] focus:ring-[hsl(var(--accent-purple))]/20 transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-sans">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background/50 border-border focus:border-[hsl(var(--accent-purple))] focus:ring-[hsl(var(--accent-purple))]/20 transition-all"
            />
          </div>

          <Button 
            type="submit"
            className="w-full bg-[hsl(var(--accent-purple))] hover:bg-[hsl(var(--accent-purple))]/90 transition-all py-6 text-lg font-sans hover-scale"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground font-sans mb-2">Demo Accounts:</p>
          <div className="space-y-1 text-xs text-foreground">
            <p>Admin: admin@company.com</p>
            <p>Manager: manager@company.com</p>
            <p>Employee: employee@company.com</p>
          </div>
        </div>

        <p className="text-center text-muted-foreground mt-6 font-sans">
          Accounts are created by Admin. Please contact your Admin.
        </p>
      </Card>
    </div>
  );
};

export default Login;
