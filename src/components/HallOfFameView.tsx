import React from 'react';
import {
  Trophy,
  Award,
  Phone,
  Sparkles,
  PartyPopper,
  CheckCircle,
  ExternalLink,
  X,
} from 'lucide-react';
import { HallOfFameEntry } from '../types';
import confetti from 'canvas-confetti';

interface HallOfFameViewProps {
  entries: HallOfFameEntry[];
  onBackToDashboard?: () => void;
}

export const HallOfFameView: React.FC<HallOfFameViewProps> = ({ entries, onBackToDashboard }) => {
  const triggerCelebration = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-20"
            title="Back to Dashboard"
            aria-label="Back to Dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pr-10 md:pr-0">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/30">
              <Trophy className="w-3.5 h-3.5" />
              <span>Public Transparency & Merit Board</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              MegaQash Hall of Fame
            </h2>
            <p className="text-emerald-100/90 text-sm max-w-2xl leading-relaxed">
              Celebrating exceptional members whose blog analyses and original academic writings were approved by the Admin. Each winner received immediate M-Pesa account credit. Reach out to them directly for writing mentorship!
            </p>
          </div>

          <button
            onClick={triggerCelebration}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95 cursor-pointer shrink-0"
          >
            <PartyPopper className="w-4 h-4" />
            <span>Celebrate Winners</span>
          </button>
        </div>
      </div>

      {/* Hall of Fame Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-200/80 flex flex-col justify-between hover:shadow-md hover:border-emerald-300 transition-all duration-200 relative group"
          >
            <div>
              {/* Badge & Rank */}
              <div className="flex items-center justify-between mb-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center font-mono">
                  #{index + 1}
                </span>
                <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md border border-amber-200">
                  Credited KSh {entry.amountCredited}
                </span>
              </div>

              {/* Title / Achievement */}
              <h3 className="font-extrabold text-base text-slate-900 leading-snug mb-2 group-hover:text-emerald-800 transition-colors">
                {entry.achievementTitle}
              </h3>

              {/* Congratulations Message */}
              <p className="text-xs text-slate-600 leading-relaxed bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 italic mb-4">
                "{entry.congratsMessage}"
              </p>
            </div>

            {/* Author Phone & Transparency Footnote */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Winner:</span>
                <span className="font-bold text-slate-900">{entry.userName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-700" />
                  M-Pesa Phone:
                </span>
                <span className="font-mono font-bold text-emerald-800 tracking-wide">
                  {entry.userPhone}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Category: {entry.category === 'academic' ? 'Academic Writing' : 'Blog Review'}</span>
                <span>{entry.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
