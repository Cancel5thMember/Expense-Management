import { DashboardLayout } from '@/components/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/StatCard';
import { DollarSign, TrendingUp, TrendingDown, Users, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminAnalytics = () => {
  const { bills, employees } = useApp();

  const totalExpenses = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const approvedExpenses = bills.filter(b => b.status === 'approved').reduce((sum, bill) => sum + bill.amount, 0);
  const pendingExpenses = bills.filter(b => b.status === 'pending').reduce((sum, bill) => sum + bill.amount, 0);
  const rejectedExpenses = bills.filter(b => b.status === 'rejected').reduce((sum, bill) => sum + bill.amount, 0);

  // Monthly trend data
  const monthlyData = [
    { month: 'Jan', expenses: 12500 },
    { month: 'Feb', expenses: 15300 },
    { month: 'Mar', expenses: 18700 },
    { month: 'Apr', expenses: 14200 },
    { month: 'May', expenses: 21000 },
    { month: 'Jun', expenses: 19500 },
  ];

  // Category breakdown
  const categoryData = [
    { name: 'Office Supplies', value: 4500, color: 'hsl(var(--accent-orange))' },
    { name: 'Meals & Entertainment', value: 8200, color: 'hsl(var(--accent-green))' },
    { name: 'Travel', value: 12500, color: 'hsl(var(--accent-purple))' },
    { name: 'Software', value: 6800, color: 'hsl(var(--accent-teal))' },
    { name: 'Other', value: 3200, color: 'hsl(var(--accent-yellow))' },
  ];

  // Approval performance
  const approvalData = [
    { name: 'Sarah Manager', approved: 45, rejected: 5, pending: 8 },
    { name: 'Bob Johnson', approved: 38, rejected: 7, pending: 5 },
    { name: 'Admin User', approved: 52, rejected: 3, pending: 2 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground font-sans">
            Deep insights into expense patterns and approval workflows
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Expenses"
            value={`$${totalExpenses.toFixed(2)}`}
            icon={DollarSign}
            gradient="linear-gradient(135deg, hsl(291 64% 58%) 0%, hsl(271 73% 59%) 100%)"
          />
          <StatCard
            title="Approved"
            value={`$${approvedExpenses.toFixed(2)}`}
            icon={TrendingUp}
            gradient="linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(142 76% 36%) 100%)"
          />
          <StatCard
            title="Pending"
            value={`$${pendingExpenses.toFixed(2)}`}
            icon={AlertCircle}
            gradient="linear-gradient(135deg, hsl(43 100% 67%) 0%, hsl(38 92% 50%) 100%)"
          />
          <StatCard
            title="Rejected"
            value={`$${rejectedExpenses.toFixed(2)}`}
            icon={TrendingDown}
            gradient="linear-gradient(135deg, hsl(0 72% 51%) 0%, hsl(0 63% 31%) 100%)"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h3 className="text-xl font-heading font-semibold text-foreground mb-4">
              Monthly Expense Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
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
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="hsl(var(--accent-purple))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--accent-purple))', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Category Breakdown */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h3 className="text-xl font-heading font-semibold text-foreground mb-4">
              Category-wise Spending
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

        {/* Approval Performance */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <h3 className="text-xl font-heading font-semibold text-foreground mb-4">
            Approver Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={approvalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="approved" fill="hsl(var(--status-approved))" />
              <Bar dataKey="rejected" fill="hsl(var(--status-rejected))" />
              <Bar dataKey="pending" fill="hsl(var(--status-pending))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <h3 className="text-xl font-heading font-semibold text-foreground mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {bills.slice(0, 10).map(bill => (
              <div key={bill.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg hover:bg-background/80 transition-colors cursor-pointer">
                <div>
                  <p className="font-medium text-foreground">{bill.description}</p>
                  <p className="text-sm text-muted-foreground">{bill.employeeName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">${bill.amount.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    bill.status === 'approved' ? 'bg-[hsl(var(--status-approved))]/20 text-[hsl(var(--status-approved))]' :
                    bill.status === 'rejected' ? 'bg-[hsl(var(--status-rejected))]/20 text-[hsl(var(--status-rejected))]' :
                    'bg-[hsl(var(--status-pending))]/20 text-[hsl(var(--status-pending))]'
                  }`}>
                    {bill.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
