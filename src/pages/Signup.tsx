import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const countries = [
  'United States',
  'United Kingdom',
  'India',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'China',
];

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !country) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await signup(name, email, password, country);
      toast.success('Account created as Admin');
      navigate('/admin');
    } catch (error: any) {
      const msg = typeof error?.message === 'string' ? error.message : 'Signup failed';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Create Account
          </h1>
          <p className="text-muted-foreground font-sans">
            Accounts are created by Admin. Submit details for Admin approval.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-sans">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background/50 border-border focus:border-[hsl(var(--accent-purple))] focus:ring-[hsl(var(--accent-purple))]/20 transition-all"
            />
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="country" className="text-foreground font-sans">Country</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="bg-background/50 border-border focus:border-[hsl(var(--accent-purple))] focus:ring-[hsl(var(--accent-purple))]/20">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit"
            className="w-full bg-[hsl(var(--accent-purple))] hover:bg-[hsl(var(--accent-purple))]/90 transition-all py-6 text-lg font-sans hover-scale"
          >
            Request Account (Admin will create)
          </Button>
        </form>

        <p className="text-center text-muted-foreground mt-6 font-sans">
          Already have an account?{' '}
          <Link to="/login" className="text-[hsl(var(--accent-amber))] hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Signup;
