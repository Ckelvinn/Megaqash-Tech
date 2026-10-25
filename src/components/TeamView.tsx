import React, { useState } from 'react';
import {
  Users,
  Copy,
  Check,
  Share2,
  DollarSign,
  UserCheck,
  Clock,
  ExternalLink,
  MessageCircle,
  X,
} from 'lucide-react';
import { User } from '../types';
import { REFERRAL_BONUS, getUserDownlines } from '../services/storage';
import confetti from 'canvas-confetti';

interface TeamViewProps {
  user: User;
  onBackToDashboard?: () => void;
}

export const TeamView: React.FC<TeamViewProps> = ({ user, onBackToDashboard }) => {
  const [copied, setCopied] = useState(false);
  const downlines = getUserDownlines(user.username);

  // Generate unique referral link
  const origin = window.location.origin;
  const referralLink = `${origin}/?ref=${encodeURIComponent(user.username)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 },
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `Join MegaQash Technologies with my exclusive invitation link and start earning through blogs, academic writing, and daily tasks! Register here: ${referralLink}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const activeDownlinesCount = downlines.filter((d) => d.isActivated).length;
  const pendingDownlinesCount = downlines.filter((d) => !d.isActivated).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
            title="Back to Dashboard"
            aria-label="Back to Dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="pr-12 md:pr-0">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4 text-emerald-700" />
            <span>Affiliate Downline & Team Network</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Team & Referral Commission
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Share your unique invite link with friends and colleagues. Whenever a user joins with your link, you instantly earn a bonus of <strong className="text-emerald-800 font-bold">KSh {REFERRAL_BONUS}</strong> per person directly to your available balance!
          </p>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200/80 text-right shrink-0">
          <span className="text-xs font-semibold text-emerald-800 block uppercase">Bonus per Invite</span>
          <span className="text-2xl font-black font-mono text-emerald-950 tabular-nums">
            KSh {REFERRAL_BONUS}
          </span>
        </div>
      </div>

      {/* Unique Referral Link Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-200/80 space-y-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Your Unique Referral Link
        </h3>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 font-mono text-xs sm:text-sm text-emerald-950 truncate select-all">
            {referralLink}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200/80 text-xs text-slate-700 flex items-start gap-2.5">
          <DollarSign className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <strong className="text-emerald-900">How earnings flow:</strong> When a user joins using your link, they see <em>"Your inviter is @{user.username}"</em> on registration. Your <strong className="font-mono">KSh {REFERRAL_BONUS}</strong> bonus goes directly to your available balance until you withdraw, at which point it moves into your Total Earnings tally!
          </div>
        </div>
      </div>

      {/* Downline Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total Downlines
          </span>
          <span className="text-3xl font-extrabold font-mono text-slate-900 mt-1 block tabular-nums">
            {downlines.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Registered via your link</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-xs">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            Activated Members
          </span>
          <span className="text-3xl font-extrabold font-mono text-emerald-700 mt-1 block tabular-nums">
            {activeDownlinesCount}
          </span>
          <span className="text-[11px] text-emerald-700 mt-1 block">Full access unlocked</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-xs">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
            Pending Activations
          </span>
          <span className="text-3xl font-extrabold font-mono text-amber-700 mt-1 block tabular-nums">
            {pendingDownlinesCount}
          </span>
          <span className="text-[11px] text-amber-700 mt-1 block">Awaiting Lipa na M-Pesa review</span>
        </div>
      </div>

      {/* Downlines Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-200/80">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-4 flex items-center justify-between">
          <span>Your Referred Members</span>
          <span className="text-xs font-mono font-bold text-slate-500">
            {downlines.length} Downline{downlines.length === 1 ? '' : 's'}
          </span>
        </h3>

        {downlines.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-slate-600">No team members invited yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Copy your unique link above and share with your network to earn KSh {REFERRAL_BONUS} per person!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-3">Username</th>
                  <th className="py-3 px-3">Names</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Registered Date</th>
                  <th className="py-3 px-3 text-right">Activation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {downlines.map((dl) => (
                  <tr key={dl.id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-emerald-950">
                      @{dl.username}
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {dl.fullName}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-600">
                      {dl.phone}
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-500">
                      {new Date(dl.registeredAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold uppercase px-2.5 py-0.5 rounded-md ${
                          dl.isActivated
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {dl.isActivated ? <UserCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {dl.isActivated ? 'Activated' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
