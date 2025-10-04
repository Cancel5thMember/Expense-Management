import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiMyExpenses, ExpenseResponse } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface Bill {
  id: string;
  description: string;
  expenseDate: string;
  category: string;
  employeeName: string;
  employeeId: string;
  paidBy: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  approvalSteps: ApprovalStep[];
  currentStep: number;
  ocrData?: {
    merchantName?: string;
    totalAmount?: number;
    date?: string;
    items?: string[];
  };
  imageUrl?: string;
  comments: Comment[];
  submittedAt: string;
}

export interface ApprovalStep {
  id: string;
  approverId: string;
  approverName: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp?: string;
  comment?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  joinDate: string;
}

interface AppContextType {
  bills: Bill[];
  employees: Employee[];
  threshold: number;
  addBill: (bill: Omit<Bill, 'id' | 'submittedAt' | 'comments'>) => void;
  updateBillStatus: (billId: string, status: 'approved' | 'rejected', comment?: string) => void;
  addComment: (billId: string, comment: string, userId: string, userName: string) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  setThreshold: (threshold: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const mockBills: Bill[] = [
  {
    id: '1',
    description: 'Office Supplies Purchase',
    expenseDate: '2025-01-15',
    category: 'Office Supplies',
    employeeName: 'John Doe',
    employeeId: 'emp001',
    paidBy: 'Company Card',
    amount: 450.00,
    status: 'pending',
    approvalSteps: [
      { id: 's1', approverId: 'm1', approverName: 'Sarah Manager', approverRole: 'Manager', status: 'pending' },
      { id: 's2', approverId: 'a1', approverName: 'Admin User', approverRole: 'Admin', status: 'pending' },
    ],
    currentStep: 0,
    ocrData: {
      merchantName: 'Office Depot',
      totalAmount: 450.00,
      date: '2025-01-15',
      items: ['Printer Paper', 'Pens', 'Folders'],
    },
    comments: [],
    submittedAt: '2025-01-15T10:30:00Z',
  },
  {
    id: '2',
    description: 'Client Dinner Meeting',
    expenseDate: '2025-01-18',
    category: 'Meals & Entertainment',
    employeeName: 'Jane Smith',
    employeeId: 'emp002',
    paidBy: 'Personal',
    amount: 1250.00,
    status: 'approved',
    approvalSteps: [
      { id: 's3', approverId: 'm1', approverName: 'Sarah Manager', approverRole: 'Manager', status: 'approved', timestamp: '2025-01-19T09:00:00Z' },
    ],
    currentStep: 1,
    ocrData: {
      merchantName: 'The Prime Restaurant',
      totalAmount: 1250.00,
      date: '2025-01-18',
      items: ['Dinner for 4', 'Beverages'],
    },
    comments: [
      { id: 'c1', userId: 'm1', userName: 'Sarah Manager', text: 'Approved for client meeting', timestamp: '2025-01-19T09:00:00Z' },
    ],
    submittedAt: '2025-01-18T20:00:00Z',
  },
];

const mockEmployees: Employee[] = [
  { id: 'emp001', name: 'John Doe', email: 'john@company.com', role: 'employee', department: 'Sales', joinDate: '2023-01-15' },
  { id: 'emp002', name: 'Jane Smith', email: 'jane@company.com', role: 'employee', department: 'Marketing', joinDate: '2023-03-20' },
  { id: 'emp003', name: 'Bob Johnson', email: 'bob@company.com', role: 'manager', department: 'Finance', joinDate: '2022-06-10' },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [threshold, setThreshold] = useState<number>(1000);
  const { user } = useAuth();

  const mapExpenseResponseToBill = (exp: ExpenseResponse): Bill => {
    return {
      id: String(exp.id),
      description: exp.description,
      expenseDate: exp.date,
      category: exp.category,
      employeeName: user?.name || 'Me',
      employeeId: String(exp.employee_id),
      paidBy: 'Personal',
      amount: exp.amount,
      status: (exp.status as 'pending' | 'approved' | 'rejected'),
      approvalSteps: [],
      currentStep: 0,
      ocrData: undefined,
      imageUrl: undefined,
      comments: [],
      submittedAt: exp.date,
    };
  };

  useEffect(() => {
    const loadMyExpenses = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const items = await apiMyExpenses(token);
        const mapped = items.map(mapExpenseResponseToBill);
        const backendIds = new Set(items.map(i => String(i.id)));
        const uniqueMapped = Array.from(new Map(mapped.map(m => [m.id, m] as const)).values());
        // Keep existing mock bills to avoid breaking manager/admin views that rely on approvalSteps
        setBills(prev => {
          const byId: Record<string, Bill> = {};
          // Add non-backend bills first
          for (const b of prev) {
            if (!backendIds.has(b.id)) {
              byId[b.id] = b;
            }
          }
          // Overwrite/add backend-mapped bills (fresh data)
          for (const m of uniqueMapped) {
            byId[m.id] = m;
          }
          return Object.values(byId);
        });
      } catch (e) {
        // Swallow errors for now; UI will continue with mocks
        console.error('Failed to load expenses from backend', e);
      }
    };
    loadMyExpenses();
    // Re-run when user changes to refresh mapping
  }, [user?.id]);

  const addBill = (bill: Omit<Bill, 'id' | 'submittedAt' | 'comments'>) => {
    const newBill: Bill = {
      ...bill,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      comments: [],
    };
    setBills(prev => [newBill, ...prev]);
  };

  const updateBillStatus = (billId: string, status: 'approved' | 'rejected', comment?: string) => {
    setBills(prev => prev.map(bill => {
      if (bill.id === billId) {
        const updatedSteps = [...bill.approvalSteps];
        if (updatedSteps[bill.currentStep]) {
          updatedSteps[bill.currentStep] = {
            ...updatedSteps[bill.currentStep],
            status,
            timestamp: new Date().toISOString(),
            comment,
          };
        }

        const allApproved = updatedSteps.every(s => s.status === 'approved');
        const anyRejected = updatedSteps.some(s => s.status === 'rejected');

        return {
          ...bill,
          approvalSteps: updatedSteps,
          currentStep: status === 'approved' ? bill.currentStep + 1 : bill.currentStep,
          status: anyRejected ? 'rejected' : allApproved ? 'approved' : 'pending',
        };
      }
      return bill;
    }));
  };

  const addComment = (billId: string, comment: string, userId: string, userName: string) => {
    setBills(prev => prev.map(bill => {
      if (bill.id === billId) {
        return {
          ...bill,
          comments: [
            ...bill.comments,
            {
              id: Date.now().toString(),
              userId,
              userName,
              text: comment,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      }
      return bill;
    }));
  };

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...employee,
      id: `emp${Date.now()}`,
    };
    setEmployees(prev => [...prev, newEmployee]);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...updates } : emp));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        bills,
        employees,
        threshold,
        addBill,
        updateBillStatus,
        addComment,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        setThreshold,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
