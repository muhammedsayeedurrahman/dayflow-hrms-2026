import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Role } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  loginAsDemoEmployee: () => void;
  loginAsDemoHR: () => void;
  logout: () => void;
}

export const DEMO_EMPLOYEE_USER: User = {
  id: 'emp-001',
  employeeId: 'EMP-1001',
  email: 'employee@dayflow.demo',
  fullName: 'Alex Vance',
  role: 'EMPLOYEE',
  department: 'Engineering',
  designation: 'Senior Frontend Engineer',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
};

export const DEMO_HR_USER: User = {
  id: 'emp-002',
  employeeId: 'EMP-1002',
  email: 'hr@dayflow.demo',
  fullName: 'Sarah Jenkins',
  role: 'HR',
  department: 'Human Resources',
  designation: 'HR Lead & People Operations',
  avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: DEMO_EMPLOYEE_USER, // Default to demo employee for instant preview
      token: 'demo-jwt-token-alex-vance',
      isAuthenticated: true,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      loginAsDemoEmployee: () => set({ user: DEMO_EMPLOYEE_USER, token: 'demo-jwt-token-alex-vance', isAuthenticated: true }),
      loginAsDemoHR: () => set({ user: DEMO_HR_USER, token: 'demo-jwt-token-sarah-jenkins', isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'dayflow-auth',
    }
  )
);
