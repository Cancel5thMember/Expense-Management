import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard } from '@/components/StatCard';
import { BillCard } from '@/components/BillCard';
import { BillDetailModal } from '@/components/BillDetailModal';
import { useApp, Bill } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const { bills, addComment } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // Filter bills for current employee
  const myBills = bills.filter(b => b.employeeId === 'emp001' || b.employeeName === user?.name);
  const submittedBills = myBills.length;
  const approvedBills = myBills.filter(b => b.status === 'approved').length;
  const pendingBills = myBills.filter(b => b.status === 'pending').length;
  const rejectedBills = myBills.filter(b => b.status === 'rejected').length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
              Employee Dashboard
            </h1>
            <p className="text-muted-foreground font-sans">
              Track your expense submissions and approvals
            </p>
          </div>
          <Button
            onClick={() => navigate('/employee/submit')}
            className="bg-[hsl(var(--accent-green))] hover:bg-[hsl(var(--accent-green))]/90 hover-scale"
          >
            Submit New Expense
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Submitted"
            value={submittedBills}
            icon={FileText}
            gradient="linear-gradient(135deg, hsl(159 64% 63%) 0%, hsl(155 71% 77%) 100%)"
          />
          <StatCard
            title="Approved"
            value={approvedBills}
            icon={CheckCircle}
            gradient="linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(142 76% 36%) 100%)"
          />
          <StatCard
            title="Pending"
            value={pendingBills}
            icon={Clock}
            gradient="linear-gradient(135deg, hsl(43 100% 67%) 0%, hsl(38 92% 50%) 100%)"
          />
          <StatCard
            title="Rejected"
            value={rejectedBills}
            icon={XCircle}
            gradient="linear-gradient(135deg, hsl(0 72% 51%) 0%, hsl(0 63% 31%) 100%)"
          />
        </div>

        {/* Recent Expenses */}
        <div className="space-y-4">
          <h2 className="text-2xl font-heading font-semibold text-foreground">
            Recent Expenses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myBills.slice(0, 6).map(bill => (
              <BillCard
                key={bill.id}
                bill={bill}
                onViewDetails={setSelectedBill}
              />
            ))}
          </div>

          {myBills.length === 0 && (
            <div className="text-center py-12 bg-card/50 rounded-lg">
              <p className="text-muted-foreground mb-4">No expenses submitted yet</p>
              <Button onClick={() => navigate('/employee/submit')}>
                Submit Your First Expense
              </Button>
            </div>
          )}
        </div>
      </div>

      <BillDetailModal
        bill={selectedBill}
        open={!!selectedBill}
        onClose={() => setSelectedBill(null)}
        onAddComment={
          user && selectedBill
            ? (comment) => addComment(selectedBill.id, comment, user.id, user.name)
            : undefined
        }
      />
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
