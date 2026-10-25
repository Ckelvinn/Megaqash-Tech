import React, { useState } from 'react';
import {
  User as UserIcon,
  Lock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { SecretAdminTrigger } from './SecretAdminTrigger';
import { loginUserAsync } from '../services/storage';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onSwitchToRegister: () => void;
  onAdminLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onSwitchToRegister,
  onAdminLogin,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await loginUserAsync(username, password);
    setIsSubmitting(false);

    if (result.success && result.user) {
      onLoginSuccess(result.user);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#eefcf2] text-slate-800 flex flex-col justify-between relative selection:bg-emerald-200">
      {/* Top Header */}
      <header className="w-full max-w-md mx-auto px-4 sm:px-6 py-5 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-emerald-900/10">
            MQ
          </div>
          <div>
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 block leading-tight">
              MegaQash Technologies
            </span>
          </div>
        </div>

        {/* Big MQ Icon on top right */}
        <div className="flex items-center gap-3">
          <SecretAdminTrigger onAdminLogin={onAdminLogin} />
        </div>
      </header>

      {/* Main Login Card - Quickest Profiles removed as requested */}
      <main className="max-w-md mx-auto w-full px-4 sm:px-6 py-4 my-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-950/5 border border-emerald-200/80">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Sign In
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Sign in to your MegaQash account
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs font-medium rounded-xl border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] rounded-xl shadow-md shadow-emerald-900/10 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-sm">
            <span className="text-slate-600">Don't have an account?</span>
            <button
              onClick={onSwitchToRegister}
              className="font-bold text-emerald-800 hover:text-emerald-900 underline underline-offset-4"
            >
              Register Here
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto px-4 py-4 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} MegaQash Technologies.
      </footer>
    </div>
  );
};
