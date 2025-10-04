import { DashboardLayout } from '@/components/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/StatCard';
import { CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ManagerAnalytics = () => {
  const { bills } = useApp();

  const myApprovedBills = bills.filter(b =>
    b.approvalSteps.some(step => step.approverRole === 'Manager' && step.status === 'approved')
  );
  const myRejectedBills = bills.filter(b =>
    b.approvalSteps.some(step => step.approverRole === 'Manager' && step.status === 'rejected')
  );
  const myPendingBills = bills.filter(b =>
    b.approvalSteps.some(step => step.approverRole === 'Manager' && step.status === 'pending')
  );

  // Approval trend data
  const trendData = [
    { month: 'Jan', approved: 12, rejected: 2 },
    { month: 'Feb', approved: 18, rejected: 3 },
    { month: 'Mar', approved: 15, rejected: 1 },
    { month: 'Apr', approved: 22, rejected: 4 },
    { month: 'May', approved: 19, rejected: 2 },
    { month: 'Jun', approved: 25, rejected: 3 },
  ];

  // Category breakdown
  const categoryData = [
    { name: 'Office Supplies', value: 28, color: 'hsl(var(--accent-orange))' },
    { name: 'Meals', value: 35, color: 'hsl(var(--accent-green))' },
    { name: 'Travel', value: 42, color: 'hsl(var(--accent-purple))' },
    { name: 'Other', value: 18, color: 'hsl(var(--accent-teal))' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
            Manager Analytics
          </h1>
          <p className="text-muted-foreground font-sans">
            Track your approval performance and team expenses
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Approved"
            value={myApprovedBills.length}
            icon={CheckCircle}
            gradient="linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(142 76% 36%) 100%)"
          />
          <StatCard
            title="Rejected"
            value={myRejectedBills.length}
            icon={XCircle}
            gradient="linear-gradient(135deg, hsl(0 72% 51%) 0%, hsl(0 63% 31%) 100%)"
          />
          <StatCard
            title="Pending"
            value={myPendingBills.length}
            icon={Clock}
            gradient="linear-gradient(135deg, hsl(43 100% 67%) 0%, hsl(38 92% 50%) 100%)"
          />
          <StatCard
            title="Avg. Approval Time"
            value="2.5 days"
            icon={TrendingUp}
            gradient="linear-gradient(135deg, hsl(330 75% 68%) 0%, hsl(330 81% 60%) 100%)"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Approval Trend */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h3 className="text-xl font-heading font-semibold text-foreground mb-4">
              Approval Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="approved" stroke="hsl(var(--status-approved))" strokeWidth={3} />
                <Line type="monotone" dataKey="rejected" stroke="hsl(var(--status-rejected))" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Team Expense Distribution */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h3 className="text-xl font-heading font-semibold text-foreground mb-4">
              Team Expense Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerAnalytics;
