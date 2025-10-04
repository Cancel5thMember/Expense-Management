import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiLogin, apiMe, apiSignup } from '@/lib/api';

export type UserRole = 'admin' | 'manager' | 'employee' | 'director' | 'assistant_manager' | 'finance';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  country: string;
  currency: string;
}

type MeResponse = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  country: string;
  currency: string;
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, country: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const countryCurrencyMap: Record<string, string> = {
  'United States': 'USD',
  'United Kingdom': 'GBP',
  'India': 'INR',
  'Canada': 'CAD',
  'Australia': 'AUD',
  'Germany': 'EUR',
  'France': 'EUR',
  'Japan': 'JPY',
  'China': 'CNY',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { access_token } = await apiLogin(email, password);
    localStorage.setItem('token', access_token);
    const me = (await apiMe(access_token)) as MeResponse;
    const loggedInUser: User = {
      id: String(me.id),
      name: me.name,
      email: me.email,
      role: me.role,
      country: me.country,
      currency: me.currency,
    };
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
  };

  const signup = async (name: string, email: string, password: string, country: string) => {
    await apiSignup({ name, email, password, country });
    const { access_token } = await apiLogin(email, password);
    localStorage.setItem('token', access_token);
    const me = (await apiMe(access_token)) as MeResponse;
    const loggedInUser: User = {
      id: String(me.id),
      name: me.name,
      email: me.email,
      role: me.role,
      country: me.country,
      currency: me.currency,
    };
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
