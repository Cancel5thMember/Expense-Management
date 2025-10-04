import { X, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bill } from '@/contexts/AppContext';
import { format } from 'date-fns';
import { useState } from 'react';

interface BillDetailModalProps {
  bill: Bill | null;
  open: boolean;
  onClose: () => void;
  onAddComment?: (comment: string) => void;
}

export const BillDetailModal: React.FC<BillDetailModalProps> = ({ 
  bill, 
  open, 
  onClose,
  onAddComment 
}) => {
  const [comment, setComment] = useState('');

  if (!bill) return null;

  const handleAddComment = () => {
    if (comment.trim() && onAddComment) {
      onAddComment(comment);
      setComment('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-[hsl(var(--status-approved))]';
      case 'rejected': return 'bg-[hsl(var(--status-rejected))]';
      case 'pending': return 'bg-[hsl(var(--status-pending))]';
      default: return 'bg-muted';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading">Bill Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bill Info Card */}
          <div className="bg-card/50 rounded-lg p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">{bill.description}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Submitted on {format(new Date(bill.submittedAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              <Badge className={`${getStatusColor(bill.status)} text-foreground`}>
                {bill.status.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Employee</p>
                <p className="font-medium text-foreground">{bill.employeeName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expense Date</p>
                <p className="font-medium text-foreground">{format(new Date(bill.expenseDate), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium text-foreground">{bill.category}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid By</p>
                <p className="font-medium text-[hsl(var(--accent-green))]">{bill.paidBy}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-2xl font-bold text-foreground">${bill.amount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* OCR Data */}
          {bill.ocrData && (
            <div className="bg-card/50 rounded-lg p-6 border border-border">
              <h4 className="font-semibold text-lg mb-4 text-foreground">OCR Extracted Data</h4>
              <div className="space-y-2">
                {bill.ocrData.merchantName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Merchant:</span>
                    <span className="font-medium text-foreground">{bill.ocrData.merchantName}</span>
                  </div>
                )}
                {bill.ocrData.totalAmount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">OCR Amount:</span>
                    <span className="font-medium text-foreground">${bill.ocrData.totalAmount.toFixed(2)}</span>
                  </div>
                )}
                {bill.ocrData.items && (
                  <div>
                    <p className="text-muted-foreground mb-2">Items:</p>
                    <ul className="list-disc list-inside text-foreground">
                      {bill.ocrData.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Approval Steps */}
          <div className="bg-card/50 rounded-lg p-6 border border-border">
            <h4 className="font-semibold text-lg mb-4 text-foreground">Approval Workflow</h4>
            <div className="space-y-3">
              {bill.approvalSteps.map((step, idx) => (
                <div 
                  key={step.id}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    step.status === 'approved' ? 'bg-[hsl(var(--status-approved))]/10' :
                    step.status === 'rejected' ? 'bg-[hsl(var(--status-rejected))]/10' :
                    'bg-muted/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.status === 'approved' ? 'bg-[hsl(var(--status-approved))]' :
                    step.status === 'rejected' ? 'bg-[hsl(var(--status-rejected))]' :
                    'bg-[hsl(var(--status-pending))]'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{step.approverName}</p>
                    <p className="text-sm text-muted-foreground">{step.approverRole}</p>
                  </div>
                  <Badge className={getStatusColor(step.status)}>
                    {step.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="bg-card/50 rounded-lg p-6 border border-border">
            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-foreground">
              <MessageSquare className="h-5 w-5" />
              Comments
            </h4>
            {bill.comments.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No comments yet</p>
            ) : (
              <div className="space-y-3 mb-4">
                {bill.comments.map(comment => (
                  <div key={comment.id} className="bg-background/50 rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-foreground">{comment.userName}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(comment.timestamp), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <p className="text-foreground">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}

            {onAddComment && (
              <div className="space-y-2">
                <Textarea 
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[80px]"
                />
                <Button onClick={handleAddComment} disabled={!comment.trim()}>
                  Add Comment
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
