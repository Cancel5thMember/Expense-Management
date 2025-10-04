import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { apiSubmitExpense } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const categories = [
  'Office Supplies',
  'Meals & Entertainment',
  'Travel',
  'Software',
  'Training',
  'Other',
];

const EmployeeSubmit = () => {
  const { addBill, threshold } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    category: 'Office Supplies',
    paidBy: 'Personal',
    amount: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const token = localStorage.getItem('token') || '';
    const payload = {
      amount,
      currency: user?.currency || 'USD',
      category: formData.category,
      description: formData.description,
      date: formData.expenseDate,
    };
    apiSubmitExpense(payload, token)
      .then(() => {
        // Add a lightweight local bill for fast feedback
        const newBill = {
          description: formData.description,
          expenseDate: formData.expenseDate,
          category: formData.category,
          employeeName: user?.name || 'Employee',
          employeeId: user?.id || '0',
          paidBy: formData.paidBy,
          amount,
          status: 'pending' as const,
          approvalSteps: [],
          currentStep: 0,
          ocrData: {
            merchantName: 'Sample Merchant',
            totalAmount: amount,
            date: formData.expenseDate,
            items: ['Sample Item'],
          },
        };
        addBill(newBill);
        toast.success('Expense submitted successfully!');
        navigate('/employee');
      })
      .catch((err) => {
        console.error('Expense submission failed', err);
        toast.error('Failed to submit expense.');
      });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
            Submit Expense
          </h1>
          <p className="text-muted-foreground font-sans">
            Submit a new expense for approval
          </p>
        </div>

        {/* Form */}
        <Card className="p-8 bg-card/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the expense..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="expenseDate">Expense Date *</Label>
                <Input
                  id="expenseDate"
                  type="date"
                  value={formData.expenseDate}
                  onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="paidBy">Paid By *</Label>
                <Select 
                  value={formData.paidBy} 
                  onValueChange={(value) => setFormData({ ...formData, paidBy: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Company Card">Company Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Expenses above ${threshold} require multi-step approval.
              </p>
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit"
                className="flex-1 bg-[hsl(var(--accent-green))] hover:bg-[hsl(var(--accent-green))]/90 py-6 text-lg hover-scale"
              >
                Submit Expense
              </Button>
              <Button 
                type="button"
                variant="outline"
                onClick={() => navigate('/employee')}
                className="flex-1 py-6 text-lg"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeSubmit;
