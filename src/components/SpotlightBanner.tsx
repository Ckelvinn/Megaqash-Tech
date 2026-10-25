import React from 'react';
import { Award, Trophy, Phone, MessageSquareQuote, Sparkles } from 'lucide-react';
import { PublishedSpotlight } from '../types';

interface SpotlightBannerProps {
  spotlights: PublishedSpotlight[];
}

export const SpotlightBanner: React.FC<SpotlightBannerProps> = ({ spotlights }) => {
  if (!spotlights || spotlights.length === 0) return null;

  return (
    <div className="space-y-4 mb-8">
      {spotlights.map((spot) => (
        <div
          key={spot.id}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-6 sm:p-8 shadow-xl border-2 border-emerald-400/40"
        >
          {/* Subtle Decorative Backdrop Elements */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Big Award Trophy Icon */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-emerald-950 flex flex-col items-center justify-center shadow-lg shrink-0 border-2 border-white/30 animate-bounce duration-1000">
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-950" />
              <span className="text-[10px] font-black uppercase tracking-widest mt-0.5">
                VERIFIED
              </span>
            </div>

            {/* Content Body */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Transparency Spotlight · Approved Task Winner
                </span>
                <span className="text-xs font-mono text-emerald-300">
                  {new Date(spot.publishedAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {spot.taskTitle}
              </h3>

              <p className="text-emerald-100/95 text-sm sm:text-base leading-relaxed">
                {spot.congratsMessage}
              </p>

              {spot.excerpt && (
                <div className="bg-black/20 rounded-xl p-3 text-xs sm:text-sm text-emerald-200/90 italic border-l-2 border-amber-400">
                  {spot.excerpt}
                </div>
              )}

              {/* Winner Contact Badge for Peer Mentorship */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5 bg-emerald-800/80 px-3 py-1.5 rounded-lg border border-emerald-600/50">
                  <span className="text-emerald-300">Author:</span>
                  <span className="text-white font-bold">{spot.userName}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-800/80 px-3 py-1.5 rounded-lg border border-emerald-600/50">
                  <Phone className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-emerald-300">Direct Contact:</span>
                  <span className="text-white font-mono font-bold tracking-wide">
                    {spot.userPhone}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-400 text-emerald-950 px-3 py-1.5 rounded-lg font-bold shadow-xs">
                  <span>Award Paid:</span>
                  <span className="font-mono">KSh {spot.amountAwarded}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
