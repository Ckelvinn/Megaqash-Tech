import React, { useState } from 'react';
import {
  Smartphone,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  AlertCircle,
  LogOut,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { User } from '../types';
import {
  MPESA_TILL,
  MPESA_ACCOUNT_NAME,
  ACTIVATION_AMOUNT,
  submitMpesaActivationAsync,
  setCurrentUser,
} from '../services/storage';

interface ActivationViewProps {
  user: User;
  onRefreshUser: () => void;
  onLogout: () => void;
}

export const ActivationView: React.FC<ActivationViewProps> = ({
  user,
  onRefreshUser,
  onLogout,
}) => {
  const [code, setCode] = useState(user.mpesaCode || '');
  const [copiedTill, setCopiedTill] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingCode, setIsEditingCode] = useState(false);

  const handleCopyTill = () => {
    navigator.clipboard.writeText(MPESA_TILL);
    setCopiedTill(true);
    setTimeout(() => setCopiedTill(false), 2000);
  };

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setIsError(true);
      setMessage('Please enter your M-Pesa transaction code.');
      return;
    }

    setIsSubmitting(true);
    setIsError(false);
    setMessage('');

    const res = await submitMpesaActivationAsync(user.id, code);
    setIsSubmitting(false);

    if (res.success) {
      setMessage(res.message);
      setIsEditingCode(false);
      onRefreshUser();
    } else {
      setIsError(true);
      setMessage(res.message);
    }
  };

  const isPending = user.activationStatus === 'pending';

  return (
    <div className="min-h-screen bg-[#eefcf2] flex flex-col justify-between p-4 md:p-8">
      {/* Top Bar */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between py-2 border-b border-emerald-200/60 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            MQ
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-lg">
            MegaQash Technologies
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-600 hidden sm:inline">
            Logged in as <strong className="text-emerald-800">@{user.username}</strong>
          </span>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Activation Card */}
      <div className="max-w-xl mx-auto w-full my-8">
        <div className="bg-white rounded-3xl shadow-xl shadow-emerald-950/5 border border-emerald-200/80 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-6 md:p-8 text-white relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-emerald-200">
                Account Onboarding
              </span>
              <span className="text-xs font-mono bg-emerald-900/60 px-2.5 py-1 rounded-md text-emerald-100 border border-emerald-500/30">
                1-Time Verification
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Activate Your Account
            </h1>
            <p className="text-emerald-100/90 text-sm mt-1">
              Welcome, {user.fullName}! Complete the Lipa na M-Pesa step below to unlock tasks, academic writing, and daily withdrawals.
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Step-by-Step Lipa na Mpesa Instructions */}
            <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200/80 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <Smartphone className="w-4 h-4 text-emerald-700" />
                <span>To Activate: Follow These Official Steps</span>
              </div>

              <div className="space-y-2.5 text-sm text-slate-700">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    Go to <strong>Lipa na M-Pesa</strong> on your phone (Buy Goods and Services)
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>Enter Till No:</span>
                    <button
                      onClick={handleCopyTill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white font-mono font-bold text-emerald-900 rounded-md border border-emerald-300 text-base shadow-xs hover:bg-emerald-50 transition-colors"
                      title="Click to copy Till Number"
                    >
                      <span>{MPESA_TILL}</span>
                      {copiedTill ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                    {copiedTill && <span className="text-xs text-emerald-700 font-medium">Copied!</span>}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    Confirm Store Name: <strong className="text-emerald-900">({MPESA_ACCOUNT_NAME})</strong>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                    4
                  </span>
                  <div>
                    Amount: <strong className="text-emerald-900 font-mono text-base">KSh {ACTIVATION_AMOUNT}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Section */}
            {isPending && !isEditingCode ? (
              <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
                      <span>Status: Pending Admin Approval</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Your transaction code is queued for verification.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-amber-200/70 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Submitted M-Pesa Code</span>
                    <span className="text-base font-bold font-mono text-slate-900">
                      {user.mpesaCode}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsEditingCode(true)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
                  >
                    Change Code
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-xs text-slate-500">
                    Admin verifies incoming M-Pesa transactions promptly.
                  </p>
                  <button
                    onClick={onRefreshUser}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-xs font-semibold text-slate-700 hover:text-emerald-800 rounded-lg border border-slate-200 shadow-xs hover:bg-slate-50 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Check Status</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Code Submission Form */
              <form onSubmit={handleSubmitCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                    Enter M-Pesa Code
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Enter the 10-character code received from M-Pesa (e.g. QK891048XA or SDR99410L)
                  </p>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. QK891048XA"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold tracking-wider text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white shadow-xs"
                    required
                  />
                </div>

                {message && (
                  <div
                    className={`flex items-start gap-2 p-3 rounded-xl text-xs font-medium ${
                      isError
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {isError ? (
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    )}
                    <span>{message}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  {isEditingCode && (
                    <button
                      type="button"
                      onClick={() => setIsEditingCode(false)}
                      className="px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] rounded-xl shadow-md shadow-emerald-900/10 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Activation Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Note on Transparency & Community */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>MegaQash Verified Gateway</span>
              <span>24/7 Account Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4">
        &copy; {new Date().getFullYear()} MegaQash Technologies. All rights reserved.
      </footer>
    </div>
  );
};
