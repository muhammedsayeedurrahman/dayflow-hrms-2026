import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [code, setCode] = useState(['4', '8', '2', '9', '1', '6']);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerified(true);
    setTimeout(() => {
      if (user?.role === 'HR') {
        navigate('/admin/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold mb-4">
          <Mail className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">Verify Your Email</h2>
        <p className="mt-2 text-xs text-slate-400">
          We sent a 6-digit verification code to <span className="font-semibold text-slate-200">{user?.email || 'your email'}</span>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900/90 border border-slate-800 py-8 px-6 shadow-2xl rounded-3xl backdrop-blur-xl sm:px-10 text-center">
          {isVerified ? (
            <div className="py-6 space-y-3 animate-in fade-in">
              <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Email Verified Successfully!</h3>
              <p className="text-xs text-slate-400">Redirecting to your Dayflow portal...</p>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="flex justify-center space-x-2">
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const newCode = [...code];
                      newCode[idx] = e.target.value;
                      setCode(newCode);
                    }}
                    className="w-11 h-12 text-center text-lg font-bold bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                ))}
              </div>

              <p className="text-xs text-slate-500">
                Demo helper: Click verify to auto-confirm code!
              </p>

              <button
                type="submit"
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <span>Verify & Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
export default VerifyEmail;
