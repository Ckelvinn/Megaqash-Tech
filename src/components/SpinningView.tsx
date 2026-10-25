import React from 'react';
import { Disc, AlertTriangle, Sparkles, Clock, RefreshCw, X } from 'lucide-react';

interface SpinningViewProps {
  onBackToDashboard?: () => void;
}

export const SpinningView: React.FC<SpinningViewProps> = ({ onBackToDashboard }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
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
            <Disc className="w-4 h-4 text-emerald-700" />
            <span>MegaQash Wheel & Bonus Lucky Draws</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Lucky Spin Wheel
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Spin the wheel to earn direct cash multipliers and surprise M-Pesa voucher credits.
          </p>
        </div>
      </div>

      {/* Main Wheel Showcase */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-emerald-200/80 text-center max-w-2xl mx-auto space-y-6">
        {/* Wheel Graphic */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto flex items-center justify-center">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-8 border-dashed border-emerald-200/90 animate-spin-slow opacity-80" />
          
          {/* Wheel Disc */}
          <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-emerald-800 via-teal-700 to-emerald-900 shadow-xl border-4 border-emerald-400 flex items-center justify-center relative overflow-hidden">
            {/* Segment Slices */}
            <div className="absolute w-full h-0.5 bg-emerald-500/40 rotate-0" />
            <div className="absolute w-full h-0.5 bg-emerald-500/40 rotate-45" />
            <div className="absolute w-full h-0.5 bg-emerald-500/40 rotate-90" />
            <div className="absolute w-full h-0.5 bg-emerald-500/40 rotate-135" />

            {/* Center Hub */}
            <div className="w-20 h-20 rounded-full bg-white shadow-lg border-4 border-amber-400 flex flex-col items-center justify-center z-10">
              <Disc className="w-6 h-6 text-emerald-800" />
              <span className="text-[10px] font-black text-slate-900 tracking-tight uppercase">
                SPIN
              </span>
            </div>
          </div>

          {/* Top Pointer */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 z-20 drop-shadow-md" />
        </div>

        {/* Required User Notice: *spin not available at the moment */}
        <div className="inline-block bg-amber-50 border-2 border-amber-300 rounded-2xl px-6 py-4 shadow-xs">
          <div className="flex items-center justify-center gap-2 text-amber-900 font-extrabold text-base sm:text-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>*spin not available at the moment</span>
          </div>
          <p className="text-xs text-amber-800/90 mt-1 max-w-md mx-auto">
            The lucky wheel undergoes maintenance and opens periodically during scheduled community booster rounds. Check back soon!
          </p>
        </div>

        {/* Disabled Action Button */}
        <div>
          <button
            disabled
            className="px-8 py-3.5 bg-slate-100 text-slate-400 font-bold text-sm rounded-xl border border-slate-200 cursor-not-allowed inline-flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            <span>Spin Currently Locked</span>
          </button>
        </div>
      </div>
    </div>
  );
};
