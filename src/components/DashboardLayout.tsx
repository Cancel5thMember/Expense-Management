import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getNavLinks = () => {
    if (user?.role === 'admin') {
      return [
        { path: '/admin', label: 'Dashboard' },
        { path: '/admin/users', label: 'Users' },
        { path: '/admin/bills', label: 'Bills' },
        { path: '/admin/analytics', label: 'Analytics' },
      ];
    }
    if (user?.role === 'manager') {
      return [
        { path: '/manager', label: 'Approvals' },
        { path: '/manager/team', label: 'Team' },
        { path: '/manager/analytics', label: 'Analytics' },
      ];
    }
    return [
      { path: '/employee', label: 'Dashboard' },
      { path: '/employee/submit', label: 'Submit' },
      { path: '/employee/expenses', label: 'Expenses' },
      { path: '/employee/analytics', label: 'Analytics' },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <nav className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-2xl font-heading font-bold text-foreground">
                ExpenseFlow
              </Link>
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "px-4 py-2 rounded-lg transition-all font-sans",
                      location.pathname === link.path
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden md:inline">
                {user?.role.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 p-6 md:p-8">
        {children}
      </main>
      
      {/* Bottom Bar */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{user?.name}</span>
            <span className="text-sm text-muted-foreground">{user?.email}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={logout}
            className="gap-2 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </footer>
    </div>
  );
};
