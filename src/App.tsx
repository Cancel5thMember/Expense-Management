import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminBills from "./pages/admin/Bills";
import AdminAnalytics from "./pages/admin/Analytics";

// Manager Pages
import ManagerDashboard from "./pages/manager/Dashboard";
import ManagerTeam from "./pages/manager/Team";
import ManagerAnalytics from "./pages/manager/Analytics";

// Employee Pages
import EmployeeDashboard from "./pages/employee/Dashboard";
import EmployeeSubmit from "./pages/employee/Submit";
import EmployeeExpenses from "./pages/employee/Expenses";
import EmployeeAnalytics from "./pages/employee/Analytics";

const queryClient = new QueryClient();

const RootRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Home />;
  }
  
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  if (user?.role === 'manager') {
    return <Navigate to="/manager" replace />;
  }
  return <Navigate to="/employee" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/bills"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminBills />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminAnalytics />
                  </ProtectedRoute>
                }
              />

              
              <Route
                path="/manager"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <ManagerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/team"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <ManagerTeam />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/analytics"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <ManagerAnalytics />
                  </ProtectedRoute>
                }
              />

              
              <Route
                path="/employee"
                element={
                  <ProtectedRoute allowedRoles={['employee', 'manager', 'admin']}>
                    <EmployeeDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/submit"
                element={
                  <ProtectedRoute allowedRoles={['employee', 'manager', 'admin']}>
                    <EmployeeSubmit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/expenses"
                element={
                  <ProtectedRoute allowedRoles={['employee', 'manager', 'admin']}>
                    <EmployeeExpenses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/analytics"
                element={
                  <ProtectedRoute allowedRoles={['employee', 'manager', 'admin']}>
                    <EmployeeAnalytics />
                  </ProtectedRoute>
                }
              />

              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
