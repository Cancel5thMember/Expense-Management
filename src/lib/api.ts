export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function apiLogin(email: string, password: string): Promise<{ access_token: string; token_type: string }>{
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiSignup(payload: {
  name: string;
  email: string;
  password: string;
  country: string;
  currency?: string;
}) {
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      country: payload.country,
      currency: payload.currency ?? payload.country,
    }),
  });
}

export async function apiMe(token: string) {
  return request('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function apiAdminCreateUser(payload: {
  name: string;
  email: string;
  password: string;
  role: string;
  country: string;
  currency: string;
}, token: string) {
  return request('/admin/users', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function apiAdminListUsers(token: string) {
  return request('/admin/users', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Expenses & Approvals APIs
export type ExpenseCreatePayload = {
  amount: number;
  currency: string;
  category: string;
  description: string;
  date?: string;
};

export type ExpenseResponse = {
  id: number;
  employee_id: number;
  company_id: number;
  amount: number;
  currency: string;
  normalized_amount: number;
  category: string;
  description: string;
  date: string;
  status: string;
};

export async function apiSubmitExpense(payload: ExpenseCreatePayload, token: string): Promise<ExpenseResponse> {
  return request('/expenses/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function apiMyExpenses(token: string): Promise<ExpenseResponse[]> {
  return request('/expenses/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export type PendingApprovalItem = {
  id: number;
  expense_id: number;
  step_order: number;
  status: string;
};

export async function apiPendingApprovals(token: string): Promise<PendingApprovalItem[]> {
  return request('/expenses/approvals/pending', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export type ApprovalDecisionPayload = { approve: boolean; comment?: string };

export async function apiDecideApproval(expenseId: number, payload: ApprovalDecisionPayload, token: string): Promise<{ status: string }> {
  return request(`/expenses/approvals/${expenseId}/decide`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}