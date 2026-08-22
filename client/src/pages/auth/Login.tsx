import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, UserCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth, loginAsDemoEmployee, loginAsDemoHR } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email address and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      if (email.includes('hr') || email.includes('admin')) {
        loginAsDemoHR();
        navigate('/admin/dashboard');
      } else {
        setAuth(
          {
            id: 'emp-001',
            employeeId: 'EMP-1001',
            email: email,
            fullName: email.split('@')[0].replace('.', ' '),
            role: 'EMPLOYEE',
            department: 'Engineering',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
          },
          'demo-jwt-token'
        );
        navigate('/employee/dashboard');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Dynamic Background Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-black text-2xl shadow-xl shadow-indigo-500/25 mb-4">
          D
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Dayflow HRMS</h1>
        <p className="mt-2 text-sm text-slate-400 font-medium">Every workday, perfectly aligned.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Quick Hackathon Demo Credentials Banner */}
        <div className="mb-6 rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Hackathon Quick Judge Access</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">One-click login as pre-populated demo users:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                loginAsDemoEmployee();
                navigate('/employee/dashboard');
              }}
              className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Login as Employee</span>
            </button>
            <button
              type="button"
              onClick={() => {
                loginAsDemoHR();
                navigate('/admin/dashboard');
              }}
              className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Login as HR Lead</span>
            </button>
          </div>
        </div>

        {/* Main Sign-In Card */}
        <div className="bg-slate-900/80 border border-slate-800 py-8 px-6 shadow-2xl rounded-3xl backdrop-blur-xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs font-medium text-rose-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Work Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="employee@dayflow.demo"
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-800 text-indigo-600 bg-slate-950" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="font-semibold text-indigo-400 hover:text-indigo-300">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign In to Dashboard'}</span>
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-800/80 pt-6 text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/signup" className="font-bold text-indigo-400 hover:text-indigo-300">
              Sign Up Employee
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-500">
          Odoo x NMIT Bangalore Hackathon 2026 • Frontend Interactive Prototype
        </p>
      </div>
    </div>
  );
};
export default Login;
