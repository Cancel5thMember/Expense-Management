import { DashboardLayout } from '@/components/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Mail, Briefcase, Activity } from 'lucide-react';

const ManagerTeam = () => {
  const { employees } = useApp();

  // Filter team members (in a real app, this would be manager's team)
  const teamMembers = employees.filter(emp => emp.role === 'employee');

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
            Team Management
          </h1>
          <p className="text-muted-foreground font-sans">
            View and manage your team members
          </p>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map(member => (
            <Card key={member.id} className="p-6 hover-scale transition-all duration-300 hover:shadow-lg">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {member.name}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {member.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        {member.department}
                      </div>
                    </div>
                  </div>
                  <Activity className="h-6 w-6 text-[hsl(var(--accent-pink))]" />
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Joined:</span>
                    <span className="text-foreground font-medium">
                      {new Date(member.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerTeam;
