import { DashboardLayout } from '@/components/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/StatCard';
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EmployeeAnalytics = () => {
  const { bills } = useApp();
  const { user } = useAuth();

  // Filter bills for current employee
  const myBills = bills.filter(b => b.employeeId === 'emp001' || b.employeeName === user?.name);
  const totalAmount = myBills.reduce((sum, bill) => sum + bill.amount, 0);
  const approvedAmount = myBills.filter(b => b.status === 'approved').reduce((sum, bill) => sum + bill.amount, 0);
  const pendingAmount = myBills.filter(b => b.status === 'pending').reduce((sum, bill) => sum + bill.amount, 0);

  // Personal expense trend
  const trendData = [
    { month: 'Jan', amount: 450 },
    { month: 'Feb', amount: 680 },
    { month: 'Mar', amount: 520 },
    { month: 'Apr', amount: 780 },
    { month: 'May', amount: 640 },
    { month: 'Jun', amount: 890 },
  ];

  // Category breakdown
  const categoryData = [
    { name: 'Office Supplies', value: 450, color: 'hsl(var(--accent-orange))' },
    { name: 'Meals', value: 1250, color: 'hsl(var(--accent-green))' },
    { name: 'Travel', value: 890, color: 'hsl(var(--accent-purple))' },
    { name: 'Other', value: 320, color: 'hsl(var(--accent-teal))' },
  ];

  // Submission vs Approval
  const statusData = [
    { status: 'Submitted', count: myBills.length },
    { status: 'Approved', count: myBills.filter(b => b.status === 'approved').length },
    { status: 'Pending', count: myBills.filter(b => b.status === 'pending').length },
    { status: 'Rejected', count: myBills.filter(b => b.status === 'rejected').length },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
            My Analytics
          </h1>
          <p className="text-muted-foreground font-sans">
            Track your personal expense patterns
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Submitted"
            value={`$${totalAmount.toFixed(2)}`}
            icon={DollarSign}
            gradient="linear-gradient(135deg, hsl(159 64% 63%) 0%, hsl(155 71% 77%) 100%)"
          />
          <StatCard
            title="Approved Amount"
            value={`$${approvedAmount.toFixed(2)}`}
            icon={CheckCircle}
            gradient="linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(142 76% 36%) 100%)"
          />
          <StatCard
            title="Pending Amount"
            value={`$${pendingAmount.toFixed(2)}`}
            icon={Clock}
            gradient="linear-gradient(135deg, hsl(43 100% 67%) 0%, hsl(38 92% 50%) 100%)"
          />
          <StatCard
            title="Avg. Approval Time"
            value="1.8 days"
            icon={TrendingUp}
            gradient="linear-gradient(135deg, hsl(258 90% 66%) 0%, hsl(271 73% 59%) 100%)"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Expense Trend */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h3 className="text-xl font-heading font-semibold text-foreground mb-4">
              Personal Expense Trend
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
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--accent-green))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--accent-green))', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Category Breakdown */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h3 className="text-xl font-heading font-semibold text-foreground mb-4">
              Category Breakdown
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

        {/* Submission vs Approval */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <h3 className="text-xl font-heading font-semibold text-foreground mb-4">
            Submission vs Approval
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="status" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--accent-green))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeAnalytics;
