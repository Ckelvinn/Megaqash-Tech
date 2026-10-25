import React, { useState } from 'react';
import {
  Wallet,
  X,
  Phone,
  Banknote,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { User } from '../types';
import { MIN_WITHDRAWAL, requestWithdrawalAsync } from '../services/storage';
import confetti from 'canvas-confetti';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onWithdrawalComplete: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  user,
  onWithdrawalComplete,
}) => {
  const [phone, setPhone] = useState(user.phone || '');
  const [amount, setAmount] = useState<number | ''>(300);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const numericAmount = Number(amount);
    if (!numericAmount || isNaN(numericAmount)) {
      setError('Please enter a valid amount.');
      return;
    }

    if (numericAmount < MIN_WITHDRAWAL) {
      setError(`Minimum withdrawal amount is KSh ${MIN_WITHDRAWAL}.`);
      return;
    }

    if (numericAmount > user.availableBalance) {
      setError(`Insufficient balance. Your available balance is KSh ${user.availableBalance}.`);
      return;
    }

    if (!phone.trim()) {
      setError('Please provide an active M-Pesa phone number.');
      return;
    }

    setIsSubmitting(true);
    const res = await requestWithdrawalAsync({
      userId: user.id,
      username: user.username,
      phone: phone.trim(),
      amount: numericAmount,
    });
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(res.message);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        onWithdrawalComplete();
        onClose();
      }, 1800);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-emerald-200 relative">
        {/* Close Button (icon taps to close) */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          title="Close withdrawal panel"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Withdraw to M-Pesa
            </h3>
            <p className="text-xs text-slate-500">
              Direct transfer to your Safaricom M-Pesa number
            </p>
          </div>
        </div>

        {/* Balance Snapshot */}
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200/80 mb-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              Available Balance
            </span>
            <span className="text-2xl font-extrabold font-mono text-emerald-950 tabular-nums">
              KSh {user.availableBalance.toLocaleString()}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase">
              Minimum Payout
            </span>
            <span className="text-sm font-bold font-mono text-slate-800 tabular-nums">
              KSh {MIN_WITHDRAWAL}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleWithdraw} className="space-y-4">
          {/* M-Pesa Phone Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              M-Pesa Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0712345678"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900"
              />
            </div>
          </div>

          {/* Amount to Withdraw */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Amount (KSh)
              </label>
              <button
                type="button"
                onClick={() => setAmount(user.availableBalance)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
              >
                Max Balance
              </button>
            </div>
            <div className="relative">
              <Banknote className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min={MIN_WITHDRAWAL}
                max={user.availableBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Minimum 300"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Minimum withdrawal: <strong className="font-mono">KSh 300</strong>. Instant dispatch upon review.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || user.availableBalance < MIN_WITHDRAWAL}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Confirm Withdrawal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
