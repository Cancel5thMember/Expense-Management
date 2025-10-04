import { Eye, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bill } from '@/contexts/AppContext';
import { format } from 'date-fns';

interface BillCardProps {
  bill: Bill;
  onViewDetails: (bill: Bill) => void;
  onApprove?: (billId: string) => void;
  onReject?: (billId: string) => void;
  showActions?: boolean;
}

export const BillCard: React.FC<BillCardProps> = ({ 
  bill, 
  onViewDetails,
  onApprove,
  onReject,
  showActions = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-[hsl(var(--status-approved))]';
      case 'rejected': return 'bg-[hsl(var(--status-rejected))]';
      case 'pending': return 'bg-[hsl(var(--status-pending))]';
      default: return 'bg-muted';
    }
  };

  return (
    <Card className="p-6 hover-scale transition-all duration-300 hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg text-foreground">{bill.description}</h3>
          <p className="text-sm text-muted-foreground">{bill.employeeName}</p>
        </div>
        <Badge className={`${getStatusColor(bill.status)} text-foreground`}>
          {bill.status.toUpperCase()}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Amount:</span>
          <span className="font-semibold text-foreground">${bill.amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Date:</span>
          <span className="text-foreground">{format(new Date(bill.expenseDate), 'MMM dd, yyyy')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Category:</span>
          <span className="text-foreground">{bill.category}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Paid by:</span>
          <span className="text-[hsl(var(--accent-green))] font-medium">{bill.paidBy}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onViewDetails(bill)}
          className="flex-1 gap-2"
        >
          <Eye className="h-4 w-4" />
          View Details
        </Button>
        {bill.comments.length > 0 && (
          <Button variant="ghost" size="sm">
            <MessageSquare className="h-4 w-4" />
            <span className="ml-1">{bill.comments.length}</span>
          </Button>
        )}
      </div>

      {showActions && bill.status === 'pending' && (
        <div className="flex gap-2 mt-3">
          <Button 
            size="sm" 
            className="flex-1 bg-[hsl(var(--status-approved))] hover:bg-[hsl(var(--status-approved))]/90"
            onClick={() => onApprove?.(bill.id)}
          >
            Approve
          </Button>
          <Button 
            size="sm" 
            variant="destructive"
            className="flex-1"
            onClick={() => onReject?.(bill.id)}
          >
            Reject
          </Button>
        </div>
      )}
    </Card>
  );
};
