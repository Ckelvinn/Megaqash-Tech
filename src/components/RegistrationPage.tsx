import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Phone,
  Lock,
  ArrowRight,
  AlertCircle,
  Users,
} from 'lucide-react';
import { SecretAdminTrigger } from './SecretAdminTrigger';
import { registerUserAsync } from '../services/storage';
import { User } from '../types';

interface RegistrationPageProps {
  onRegisterSuccess: (user: User) => void;
  onSwitchToLogin: () => void;
  onAdminLogin: () => void;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({
  onRegisterSuccess,
  onSwitchToLogin,
  onAdminLogin,
}) => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviter, setInviter] = useState<string>('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('inviter');
    if (ref) {
      setInviter(ref.trim().toLowerCase());
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !fullName.trim() || !phone.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify and retype.');
      return;
    }

    setIsSubmitting(true);
    const result = await registerUserAsync({
      username,
      fullName,
      phone,
      password,
      referrerUsername: inviter || undefined,
    });
    setIsSubmitting(false);

    if (result.success && result.user) {
      onRegisterSuccess(result.user);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#eefcf2] text-slate-800 flex flex-col justify-between relative selection:bg-emerald-200">
      {/* Top Header with Brand & Big MQ Icon in top right */}
      <header className="w-full max-w-xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between relative z-20">
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

        {/* Big MQ Icon on top right corner for Admin */}
        <div className="flex items-center gap-3">
          <SecretAdminTrigger onAdminLogin={onAdminLogin} />
        </div>
      </header>

      {/* Main Clean Centered Registration Form */}
      <main className="max-w-xl mx-auto w-full px-4 sm:px-6 py-4 my-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-950/5 border border-emerald-200/80">
          <div className="mb-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create Account
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Register with MegaQash Technologies
            </p>
          </div>

          {/* Referral Inviter Notice Banner */}
          {inviter ? (
            <div className="mb-6 bg-emerald-50 border border-emerald-300/80 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 block">
                    Referral Link
                  </span>
                  <p className="text-sm text-slate-800 font-medium">
                    Your inviter is: <strong className="text-emerald-900 font-bold">@{inviter}</strong>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-5 flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span>Have an inviter?</span>
              <input
                type="text"
                value={inviter}
                onChange={(e) => setInviter(e.target.value.toLowerCase())}
                placeholder="Enter inviter username"
                className="px-2 py-1 bg-white border border-slate-300 rounded-md text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600 w-44"
              />
            </div>
          )}

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
                  onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
                  placeholder="Enter username"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900"
                />
              </div>
            </div>

            {/* Names */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Names
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full names"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0712345678"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900"
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
                  placeholder="Enter password"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <span>Register</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200/80 flex items-center justify-between text-sm">
            <span className="text-slate-600">Already have an account?</span>
            <button
              onClick={onSwitchToLogin}
              className="font-bold text-emerald-800 hover:text-emerald-900 underline underline-offset-4"
            >
              Log In
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-xl mx-auto px-4 py-4 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} MegaQash Technologies.
      </footer>
    </div>
  );
};
