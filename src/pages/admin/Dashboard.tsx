import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard } from '@/components/StatCard';
import { BillCard } from '@/components/BillCard';
import { BillDetailModal } from '@/components/BillDetailModal';
import { useApp, Bill } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Clock, CheckCircle, XCircle, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { bills, employees, threshold, setThreshold } = useApp();
  const { user } = useAuth();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [thresholdInput, setThresholdInput] = useState(threshold.toString());

  const pendingBills = bills.filter(b => b.status === 'pending');
  const approvedBills = bills.filter(b => b.status === 'approved');
  const rejectedBills = bills.filter(b => b.status === 'rejected');

  const handleSaveThreshold = () => {
    const newThreshold = parseFloat(thresholdInput);
    if (!isNaN(newThreshold) && newThreshold > 0) {
      setThreshold(newThreshold);
      toast.success('Threshold updated successfully');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground font-sans">
            Manage expenses, users, and approval workflows
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Employees"
            value={employees.length}
            icon={Users}
            gradient="linear-gradient(135deg, hsl(291 64% 58%) 0%, hsl(271 73% 59%) 100%)"
          />
          <StatCard
            title="Pending Bills"
            value={pendingBills.length}
            icon={Clock}
            gradient="linear-gradient(135deg, hsl(43 100% 67%) 0%, hsl(38 92% 50%) 100%)"
            onClick={() => {}}
          />
          <StatCard
            title="Approved"
            value={approvedBills.length}
            icon={CheckCircle}
            gradient="linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(142 76% 36%) 100%)"
            onClick={() => {}}
          />
          <StatCard
            title="Rejected"
            value={rejectedBills.length}
            icon={XCircle}
            gradient="linear-gradient(135deg, hsl(0 72% 51%) 0%, hsl(0 63% 31%) 100%)"
            onClick={() => {}}
          />
        </div>

        {/* Threshold & Settings */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
            Approval Settings
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="threshold" className="text-foreground">
                Auto-Approval Threshold ($)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="threshold"
                  type="number"
                  value={thresholdInput}
                  onChange={(e) => setThresholdInput(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSaveThreshold}>
                  Save
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Bills below this amount are auto-assigned to first approver
              </p>
            </div>
            <div className="flex items-center justify-center">
              <Button 
                variant="destructive"
                size="lg"
                className="hover-scale"
              >
                Veto Approval
              </Button>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="h-6 w-6 text-[hsl(var(--accent-yellow))]" />
            <h2 className="text-xl font-heading font-semibold text-foreground">
              Recent Activity
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bills.slice(0, 6).map(bill => (
              <BillCard
                key={bill.id}
                bill={bill}
                onViewDetails={setSelectedBill}
              />
            ))}
          </div>
        </Card>
      </div>

      <BillDetailModal
        bill={selectedBill}
        open={!!selectedBill}
        onClose={() => setSelectedBill(null)}
      />
    </DashboardLayout>
  );
};

export default AdminDashboard;
