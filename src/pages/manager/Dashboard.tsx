import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard } from '@/components/StatCard';
import { BillCard } from '@/components/BillCard';
import { BillDetailModal } from '@/components/BillDetailModal';
import { ApprovalStepper } from '@/components/ApprovalStepper';
import { useApp, Bill } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, CheckCircle, Users, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';

const ManagerDashboard = () => {
  const { bills, updateBillStatus, addComment } = useApp();
  const { user } = useAuth();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // Filter bills where manager is an approver
  const myPendingBills = bills.filter(b => 
    b.status === 'pending' && 
    b.approvalSteps.some(step => step.approverRole === 'Manager' && step.status === 'pending')
  );

  const myApprovedBills = bills.filter(b =>
    b.approvalSteps.some(step => step.approverRole === 'Manager' && step.status === 'approved')
  );

  const totalAmount = myApprovedBills.reduce((sum, bill) => sum + bill.amount, 0);

  const handleApprove = (billId: string) => {
    updateBillStatus(billId, 'approved', 'Approved by manager');
    if (user) {
      addComment(billId, 'Approved by manager', user.id, user.name);
    }
  };

  const handleReject = (billId: string) => {
    updateBillStatus(billId, 'rejected', 'Rejected by manager');
    if (user) {
      addComment(billId, 'Rejected by manager', user.id, user.name);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
            Manager Dashboard
          </h1>
          <p className="text-muted-foreground font-sans">
            Review and approve team expenses
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Pending Approvals"
            value={myPendingBills.length}
            icon={Clock}
            gradient="linear-gradient(135deg, hsl(330 75% 68%) 0%, hsl(330 81% 60%) 100%)"
          />
          <StatCard
            title="Approved This Month"
            value={myApprovedBills.length}
            icon={CheckCircle}
            gradient="linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(142 76% 36%) 100%)"
          />
          <StatCard
            title="Team Members"
            value={8}
            icon={Users}
            gradient="linear-gradient(135deg, hsl(173 80% 40%) 0%, hsl(159 64% 63%) 100%)"
          />
          <StatCard
            title="Amount Approved"
            value={`$${totalAmount.toFixed(2)}`}
            icon={DollarSign}
            gradient="linear-gradient(135deg, hsl(258 90% 66%) 0%, hsl(271 73% 59%) 100%)"
          />
        </div>

        {/* Pending Approvals with Stepper */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <h2 className="text-xl font-heading font-semibold text-foreground mb-6">
            Pending Approvals
          </h2>
          <div className="space-y-6">
            {myPendingBills.map(bill => (
              <div key={bill.id} className="bg-background/50 rounded-lg p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{bill.description}</h3>
                    <p className="text-sm text-muted-foreground">{bill.employeeName} • ${bill.amount.toFixed(2)}</p>
                  </div>
                  <span className="text-sm px-3 py-1 rounded bg-[hsl(var(--status-pending))]/20 text-[hsl(var(--status-pending))]">
                    PENDING
                  </span>
                </div>

                {/* Approval Stepper */}
                <ApprovalStepper steps={bill.approvalSteps} currentStep={bill.currentStep} />

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <BillCard
                    bill={bill}
                    onViewDetails={setSelectedBill}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    showActions={true}
                  />
                </div>
              </div>
            ))}

            {myPendingBills.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No pending approvals</p>
              </div>
            )}
          </div>
        </Card>
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

export default ManagerDashboard;
