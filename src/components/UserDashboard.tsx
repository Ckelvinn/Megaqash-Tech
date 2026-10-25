import React, { useState } from 'react';
import {
  Menu,
  Wallet,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  Languages,
  HelpCircle,
  Trophy,
  Users,
  Disc,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { User, TaskItem, TaskSubmission, HallOfFameEntry, PublishedSpotlight } from '../types';
import { NavigationDrawer, DashboardViewType } from './NavigationDrawer';
import { WithdrawModal } from './WithdrawModal';
import { BlogsView } from './BlogsView';
import { AcademicWritingView } from './AcademicWritingView';
import { TranslationTasksView } from './TranslationTasksView';
import { TriviaView } from './TriviaView';
import { HallOfFameView } from './HallOfFameView';
import { SpinningView } from './SpinningView';
import { TeamView } from './TeamView';
import { MIN_WITHDRAWAL } from '../services/storage';

interface UserDashboardProps {
  user: User;
  tasks: TaskItem[];
  submissions: TaskSubmission[];
  hallOfFame: HallOfFameEntry[];
  spotlights: PublishedSpotlight[];
  onRefreshData: () => void;
  onLogout: () => void;
  onOpenAdmin: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  tasks,
  submissions,
  hallOfFame,
  spotlights,
  onRefreshData,
  onLogout,
  onOpenAdmin,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentView, setCurrentView] = useState<DashboardViewType>('overview');
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#eefcf2] text-slate-800 flex flex-col justify-between selection:bg-emerald-200">
      {/* 3-Lines Navigation Drawer */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentView={currentView}
        onSelectView={(v) => setCurrentView(v)}
        user={user}
        onLogout={onLogout}
      />

      {/* Withdraw Modal (taps to open and close) */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        user={user}
        onWithdrawalComplete={onRefreshData}
      />

      {/* Top Header - Note: Withdrawal button removed from header as requested */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-200/80 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Top Left: 3-Lines Toggle Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-transform active:scale-95 cursor-pointer shadow-2xs"
              title="Open Navigation Menu"
              aria-label="Open Menu"
            >
              <Menu className="w-5 h-5 text-emerald-800" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                MQ
              </div>
              <div>
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight block leading-tight">
                  MegaQash Technologies
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 tracking-wide">
                  Member Portal
                </span>
              </div>
            </div>
          </div>

          {/* Top Right: User Account Profile */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {user.fullName}
              </span>
              <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                @{user.username}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 my-auto">
        {/* Render Specific Subview or Overview */}
        {currentView === 'blogs' && (
          <BlogsView
            user={user}
            blogs={tasks.filter((t) => t.type === 'blog')}
            submissions={submissions}
            onRefreshData={onRefreshData}
            onBackToDashboard={() => setCurrentView('overview')}
          />
        )}

        {currentView === 'academic' && (
          <AcademicWritingView
            user={user}
            submissions={submissions}
            onRefreshData={onRefreshData}
            onBackToDashboard={() => setCurrentView('overview')}
          />
        )}

        {currentView === 'translation' && (
          <TranslationTasksView
            user={user}
            tasks={tasks}
            submissions={submissions}
            onRefreshData={onRefreshData}
            onBackToDashboard={() => setCurrentView('overview')}
          />
        )}

        {currentView === 'trivia' && (
          <TriviaView
            user={user}
            tasks={tasks}
            submissions={submissions}
            onRefreshData={onRefreshData}
            onBackToDashboard={() => setCurrentView('overview')}
          />
        )}

        {currentView === 'hall_of_fame' && (
          <HallOfFameView
            entries={hallOfFame}
            onBackToDashboard={() => setCurrentView('overview')}
          />
        )}

        {currentView === 'spinning' && (
          <SpinningView onBackToDashboard={() => setCurrentView('overview')} />
        )}

        {currentView === 'team' && (
          <TeamView
            user={user}
            onBackToDashboard={() => setCurrentView('overview')}
          />
        )}

        {currentView === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Note: Transparency Spotlight removed from dashboard overview as requested */}

            {/* Core Financial Cards: Total Earnings UP followed by Available Balance */}
            <div className="space-y-4">
              {/* Card 1 (UP): Total Earnings */}
              <div className="relative overflow-hidden bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-200/90 flex flex-col justify-between group hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 block mb-1">
                      Total Earnings
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-900 tabular-nums">
                      KSh {user.totalEarnings.toLocaleString()}
                    </h2>
                    <p className="text-xs text-slate-500 mt-2 font-medium">
                      Total accumulated revenue across withdrawals, tasks, and downline bonuses
                    </p>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-2xs">
                    <TrendingUp className="w-7 h-7" />
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-semibold">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verified Lifetime Accumulation</span>
                  </div>
                  <span className="font-mono text-slate-400">
                    ID: {user.id.slice(-6)}
                  </span>
                </div>
              </div>

              {/* Card 2 (FOLLOWED BY): Available Balance */}
              <div className="relative overflow-hidden bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-200/90 flex flex-col justify-between group hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 block mb-1">
                      Available Balance
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-emerald-950 tabular-nums">
                      KSh {user.availableBalance.toLocaleString()}
                    </h2>
                    <p className="text-xs text-slate-500 mt-2 font-medium">
                      Ready for withdrawal directly to M-Pesa (Min KSh {MIN_WITHDRAWAL})
                    </p>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 shadow-2xs">
                    <Wallet className="w-7 h-7" />
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setIsWithdrawOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Tap to Withdraw</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-mono text-emerald-700 font-semibold">
                    Lipa na M-Pesa Validated
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Task Modules Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Available Earning Portals
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tap any portal to start reading blogs, writing essays, or doing translations
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Blogs */}
                <button
                  onClick={() => setCurrentView('blogs')}
                  className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                      KSh 100
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-slate-900 mb-1 group-hover:text-emerald-800 transition-colors">
                    Blogs (3 Available)
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    Review featured publications and earn KSh 100 per verified summary.
                  </p>
                </button>

                {/* 2. Academic Writing */}
                <button
                  onClick={() => setCurrentView('academic')}
                  className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                      KSh 100
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-slate-900 mb-1 group-hover:text-emerald-800 transition-colors">
                    Academic Writing
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    Write a blog of your choice; approved submissions get credited KSh 100.
                  </p>
                </button>

                {/* 3. Translation Tasks */}
                <button
                  onClick={() => setCurrentView('translation')}
                  className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                      <Languages className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md">
                      KSh 5 / Task
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-slate-900 mb-1 group-hover:text-emerald-800 transition-colors">
                    Translation Tasks (5)
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    Quick multi-language localization tasks with immediate admin review.
                  </p>
                </button>

                {/* 4. Trivia */}
                <button
                  onClick={() => setCurrentView('trivia')}
                  className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                      KSh 5 / Question
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-slate-900 mb-1 group-hover:text-emerald-800 transition-colors">
                    Daily Trivia (3)
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    Answer heritage, technology, and economic multiple choice questions.
                  </p>
                </button>
              </div>
            </div>

            {/* Bottom 2-Column Banner: Team Affiliate & Hall of Fame Quick Jump */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team Affiliate Card */}
              <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-7 shadow-md flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block mb-1">
                    Affiliate Network
                  </span>
                  <h4 className="text-2xl font-extrabold tracking-tight mb-2">
                    Earn KSh 300 Per Invited Friend
                  </h4>
                  <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed mb-4">
                    Share your unique invite link. Bonus is deposited into your available balance as soon as they join!
                  </p>
                </div>
                <button
                  onClick={() => setCurrentView('team')}
                  className="inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-white text-emerald-950 font-bold text-xs uppercase tracking-wider hover:bg-emerald-50 transition-colors cursor-pointer w-full sm:w-auto self-start"
                >
                  <span>Open Team Dashboard</span>
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              </div>

              {/* Hall of Fame Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Transparency
                    </span>
                  </div>
                  <h4 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                    Hall of Fame Winners
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                    View verified members who had their blogs approved, their phone numbers, credited amounts, and mentorship contacts.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentView('hall_of_fame')}
                  className="inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs uppercase tracking-wider hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer w-full sm:w-auto self-start"
                >
                  <span>View Hall of Fame</span>
                  <ChevronRight className="w-4 h-4 ml-2 text-emerald-700" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-5 border-t border-emerald-200/60 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>&copy; {new Date().getFullYear()} MegaQash Technologies. All rights reserved.</span>
        <span>Lipa na M-Pesa Till: 8286400 (Firiop enterprises)</span>
      </footer>
    </div>
  );
};
