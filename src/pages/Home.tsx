import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Receipt, CheckCircle, FileSearch, BarChart3, Users, Shield } from 'lucide-react';
import heroImage from '@/assets/hero-expense.png';

const Home = () => {
  const features = [
    {
      icon: Receipt,
      title: 'Submit Expenses',
      description: 'Easy bill submission with receipt upload and automatic OCR extraction',
      gradient: 'linear-gradient(135deg, hsl(22 93% 54%) 0%, hsl(38 92% 50%) 100%)',
    },
    {
      icon: CheckCircle,
      title: 'Multi-Step Approvals',
      description: 'Dynamic approval workflows with unlimited approvers and 60% approval logic',
      gradient: 'linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(142 76% 36%) 100%)',
    },
    {
      icon: FileSearch,
      title: 'OCR Verification',
      description: 'Automatic data extraction from receipts with intelligent verification',
      gradient: 'linear-gradient(135deg, hsl(258 90% 66%) 0%, hsl(271 73% 59%) 100%)',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Deep insights with interactive charts and real-time expense tracking',
      gradient: 'linear-gradient(135deg, hsl(330 81% 60%) 0%, hsl(291 64% 58%) 100%)',
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Manage employees, roles, and permissions across your organization',
      gradient: 'linear-gradient(135deg, hsl(173 80% 40%) 0%, hsl(159 64% 63%) 100%)',
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Secure dashboards for Admin, Manager, and Employee roles',
      gradient: 'linear-gradient(135deg, hsl(43 100% 67%) 0%, hsl(38 92% 50%) 100%)',
    },
  ];

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-heading font-bold text-foreground mb-6 leading-tight">
              Modern Expense Management
            </h1>
            <p className="text-xl text-muted-foreground mb-8 font-sans">
              Streamline your expense workflow with OCR verification, multi-step approvals, and powerful analytics. Built for teams that value efficiency.
            </p>
            <div className="flex gap-4">
              <Link to="/login">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-[hsl(var(--accent-orange))] hover:bg-[hsl(var(--accent-orange))]/90 hover-scale"
                >
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-6 hover-scale border-[hsl(var(--accent-green))] text-[hsl(var(--accent-green))] hover:bg-[hsl(var(--accent-green))]/10"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--accent-purple))] to-[hsl(var(--accent-orange))] blur-3xl opacity-20 rounded-full"></div>
            <img 
              src={heroImage} 
              alt="Expense Management Dashboard" 
              className="relative rounded-2xl shadow-2xl hover-scale"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-heading font-bold text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground font-sans">
            Powerful features designed for modern expense management
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Card 
              key={idx}
              className="p-8 hover-scale hover-glow transition-all duration-300 cursor-pointer border-border/50"
              style={{ background: feature.gradient }}
            >
              <feature.icon className="h-12 w-12 text-foreground mb-4" />
              <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-foreground/80 font-sans">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <Card className="p-12 text-center bg-gradient-to-r from-[hsl(var(--accent-purple))] to-[hsl(var(--accent-orange))]">
          <h2 className="text-4xl font-heading font-bold text-foreground mb-4">
            Ready to Transform Your Expense Management?
          </h2>
          <p className="text-xl text-foreground/90 mb-8 font-sans">
            Join teams that trust ExpenseFlow for their expense workflows
          </p>
          <Link to="/signup">
            <Button 
              size="lg" 
              className="text-lg px-12 py-6 bg-foreground text-background hover:bg-foreground/90 hover-scale"
            >
              Start Free Trial
            </Button>
          </Link>
        </Card>
      </section>
    </div>
  );
};

export default Home;
