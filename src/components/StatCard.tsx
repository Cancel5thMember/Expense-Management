import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, gradient, onClick }) => {
  return (
    <Card 
      className={`p-6 hover-scale cursor-pointer transition-all duration-300 ${onClick ? 'hover:shadow-lg' : ''}`}
      style={gradient ? { background: gradient } : undefined}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground/80">{title}</h3>
        <Icon className="h-5 w-5 text-foreground/60" />
      </div>
      <div className="text-3xl font-bold text-foreground">{value}</div>
    </Card>
  );
};
