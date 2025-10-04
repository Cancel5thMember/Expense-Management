import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { BillCard } from '@/components/BillCard';
import { BillDetailModal } from '@/components/BillDetailModal';
import { useApp, Bill } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

const AdminBills = () => {
  const { bills, updateBillStatus, addComment } = useApp();
  const { user } = useAuth();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (billId: string) => {
    updateBillStatus(billId, 'approved', 'Approved by admin');
    if (user) {
      addComment(billId, 'Approved by admin', user.id, user.name);
    }
  };

  const handleReject = (billId: string) => {
    updateBillStatus(billId, 'rejected', 'Rejected by admin');
    if (user) {
      addComment(billId, 'Rejected by admin', user.id, user.name);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
            Bill Management
          </h1>
          <p className="text-muted-foreground font-sans">
            Review and manage expense bills
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search bills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBills.map(bill => (
            <BillCard
              key={bill.id}
              bill={bill}
              onViewDetails={setSelectedBill}
              onApprove={handleApprove}
              onReject={handleReject}
              showActions={true}
            />
          ))}
        </div>

        {filteredBills.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No bills found</p>
          </div>
        )}
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

export default AdminBills;
