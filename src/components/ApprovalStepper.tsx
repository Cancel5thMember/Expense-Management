import { Check, X, Clock } from 'lucide-react';
import { ApprovalStep } from '@/contexts/AppContext';

interface ApprovalStepperProps {
  steps: ApprovalStep[];
  currentStep: number;
}

export const ApprovalStepper: React.FC<ApprovalStepperProps> = ({ steps, currentStep }) => {
  const getStepIcon = (step: ApprovalStep, index: number) => {
    if (step.status === 'approved') {
      return <Check className="h-5 w-5 text-white" />;
    }
    if (step.status === 'rejected') {
      return <X className="h-5 w-5 text-white" />;
    }
    if (index === currentStep) {
      return <Clock className="h-5 w-5 text-white" />;
    }
    return <span className="text-white text-sm">{index + 1}</span>;
  };

  const getStepColor = (step: ApprovalStep, index: number) => {
    if (step.status === 'approved') return 'bg-[hsl(var(--status-approved))]';
    if (step.status === 'rejected') return 'bg-[hsl(var(--status-rejected))]';
    if (index === currentStep) return 'bg-[hsl(var(--status-pending))]';
    return 'bg-muted';
  };

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center flex-1 relative">
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div 
                className={`absolute top-6 left-[50%] w-full h-0.5 ${
                  step.status === 'approved' ? 'bg-[hsl(var(--status-approved))]' : 'bg-muted'
                }`}
              />
            )}

            {/* Step circle */}
            <div 
              className={`w-12 h-12 rounded-full flex items-center justify-center ${getStepColor(step, index)} z-10 transition-all duration-300`}
            >
              {getStepIcon(step, index)}
            </div>

            {/* Step info */}
            <div className="text-center mt-3">
              <p className="font-medium text-sm text-foreground">{step.approverName}</p>
              <p className="text-xs text-muted-foreground">{step.approverRole}</p>
              <p className={`text-xs font-medium mt-1 ${
                step.status === 'approved' ? 'text-[hsl(var(--status-approved))]' :
                step.status === 'rejected' ? 'text-[hsl(var(--status-rejected))]' :
                'text-[hsl(var(--status-pending))]'
              }`}>
                {step.status.toUpperCase()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
