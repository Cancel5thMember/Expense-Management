import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useApp, Employee } from '@/contexts/AppContext';
import { apiAdminCreateUser } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserPlus, Mail, Briefcase, Calendar, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const roles = ['employee', 'manager', 'admin', 'director', 'assistant_manager', 'finance'];
const departments = ['Sales', 'Marketing', 'Finance', 'Operations', 'HR', 'IT', 'Engineering'];

const AdminUsers = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: 'Sales',
    joinDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || (!editingEmployee && !formData.password)) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, formData);
      toast.success('Employee updated successfully');
    } else {
      try {
        const token = localStorage.getItem('token') || '';
        await apiAdminCreateUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          country: 'United States',
          currency: 'USD',
        }, token);
        // Sync local list for UI display
        addEmployee({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          department: formData.department,
          joinDate: formData.joinDate,
        });
        toast.success('User created successfully');
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to create user';
        toast.error(message);
        return;
      }
    }

    setShowAddModal(false);
    setEditingEmployee(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'employee',
      department: 'Sales',
      joinDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      password: '',
      role: employee.role,
      department: employee.department,
      joinDate: employee.joinDate,
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      deleteEmployee(id);
      toast.success('Employee deleted successfully');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
              User Management
            </h1>
            <p className="text-muted-foreground font-sans">
              Add, edit, and manage employee accounts
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="gap-2 bg-[hsl(var(--accent-magenta))] hover:bg-[hsl(var(--accent-magenta))]/90 hover-scale"
          >
            <UserPlus className="h-5 w-5" />
            Add Employee
          </Button>
        </div>

        {/* Employee Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map(employee => (
            <Card key={employee.id} className="p-6 hover-scale transition-all duration-300 hover:shadow-lg border-[hsl(var(--accent-pink))]/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {employee.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Mail className="h-4 w-4" />
                    {employee.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Briefcase className="h-4 w-4" />
                    {employee.department}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(employee.joinDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-sm font-medium px-3 py-1 rounded-full bg-[hsl(var(--accent-yellow))]/20 text-[hsl(var(--accent-yellow))]">
                  {employee.role.toUpperCase()}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(employee)}
                    className="hover:bg-[hsl(var(--accent-teal))]/10 hover:text-[hsl(var(--accent-teal))]"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(employee.id)}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Add/Edit Employee Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading">
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@company.com"
              />
            </div>

            {!editingEmployee && (
              <div className="space-y-2">
                <Label htmlFor="password">Temporary Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter a temporary password"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>
                      {role.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="joinDate">Join Date</Label>
              <Input
                id="joinDate"
                type="date"
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
              />
            </div>

            <Button onClick={handleSubmit} className="w-full">
              {editingEmployee ? 'Update Employee' : 'Add Employee'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminUsers;
