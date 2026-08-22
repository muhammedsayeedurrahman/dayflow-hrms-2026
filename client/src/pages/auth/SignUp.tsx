import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useHRMSStore } from '../../store/hrmsStore';

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { addEmployee } = useHRMSStore();

  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('EMP-' + Math.floor(1000 + Math.random() * 9000));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'EMPLOYEE' | 'HR'>('EMPLOYEE');
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreed) {
      setError('You must agree to the Terms of Service.');
      return;
    }

    // Register employee in state
    const newEmpId = `emp-${Date.now()}`;
    addEmployee({
      id: newEmpId,
      employeeId: employeeId,
      firstName: fullName.split(' ')[0],
      lastName: fullName.split(' ')[1] || '',
      fullName: fullName,
      email: email,
      phone: '+91 98000 00000',
      address: 'Bangalore, Karnataka, India',
      department: role === 'HR' ? 'Human Resources' : 'Engineering',
      designation: role === 'HR' ? 'HR Specialist' : 'Software Engineer',
      joiningDate: new Date().toISOString().split('T')[0],
      employmentType: 'Full-time',
      status: 'Active',
      managerName: 'Sarah Jenkins (HR Lead)',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      salary: {
        basic: 50000,
        hra: 20000,
        specialAllowance: 15000,
        pfDeduction: 6000,
        taxDeduction: 4000,
        grossSalary: 85000,
        netSalary: 75000,
        effectiveDate: new Date().toISOString().split('T')[0],
      },
      documents: [],
    });

    setAuth(
      {
        id: newEmpId,
        employeeId: employeeId,
        email: email,
        fullName: fullName,
        role: role,
        department: role === 'HR' ? 'Human Resources' : 'Engineering',
      },
      'demo-jwt-token'
    );

    navigate('/verify-email');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-lg mb-3">
          D
        </div>
        <h2 className="text-2xl font-extrabold text-white">Create Employee Account</h2>
        <p className="mt-1 text-xs text-slate-400">Join Dayflow HRMS platform</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900/90 border border-slate-800 py-8 px-6 shadow-2xl rounded-3xl backdrop-blur-xl sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Vance"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-300 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Account Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'EMPLOYEE' | 'HR')}
                  className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="HR">HR / Admin</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.vance@dayflow.demo"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="rounded border-slate-800 text-indigo-600 bg-slate-950"
              />
              <span>I agree to Dayflow HRMS terms & security consent policy.</span>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>Create Account & Verify</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 border-t border-slate-800/80 pt-4 text-center text-xs text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-indigo-400 hover:text-indigo-300">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SignUp;
