import React from 'react';
import {
  X,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Languages,
  HelpCircle,
  Trophy,
  Disc,
  Users,
  Wallet,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { User } from '../types';

export type DashboardViewType =
  | 'overview'
  | 'blogs'
  | 'academic'
  | 'translation'
  | 'trivia'
  | 'hall_of_fame'
  | 'spinning'
  | 'team';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: DashboardViewType;
  onSelectView: (view: DashboardViewType) => void;
  user: User;
  onLogout: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  currentView,
  onSelectView,
  user,
  onLogout,
}) => {
  if (!isOpen) return null;

  const navItems: { id: DashboardViewType; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'blogs',
      label: 'Blogs',
      icon: <BookOpen className="w-5 h-5" />,
      badge: '3 Available',
    },
    {
      id: 'academic',
      label: 'Academic writting',
      icon: <GraduationCap className="w-5 h-5" />,
      badge: 'KSh 100',
    },
    {
      id: 'translation',
      label: 'Translation tasks',
      icon: <Languages className="w-5 h-5" />,
      badge: '5 Tasks',
    },
    {
      id: 'trivia',
      label: 'Trivia',
      icon: <HelpCircle className="w-5 h-5" />,
      badge: '3 Questions',
    },
    {
      id: 'hall_of_fame',
      label: 'Hall of fame',
      icon: <Trophy className="w-5 h-5" />,
      badge: 'Winners',
    },
    {
      id: 'spinning',
      label: 'Spinning',
      icon: <Disc className="w-5 h-5" />,
    },
    {
      id: 'team',
      label: 'Team',
      icon: <Users className="w-5 h-5" />,
      badge: 'KSh 300 / Ref',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer on the Left */}
      <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
        <div>
          {/* Drawer Header */}
          <div className="p-5 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                MQ
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-base block leading-tight">
                  MegaQash
                </span>
                <span className="text-[11px] font-semibold text-emerald-700">
                  Technologies
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Status Bar inside Drawer */}
          <div className="p-4 mx-4 mt-4 bg-emerald-900 text-white rounded-2xl shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 block">
              Active Member
            </span>
            <span className="text-sm font-bold text-white block truncate">
              {user.fullName}
            </span>
            <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-emerald-800/80 font-mono">
              <span className="text-emerald-200">Balance:</span>
              <span className="font-bold text-white">KSh {user.availableBalance.toLocaleString()}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 mt-2 overflow-y-auto max-h-[calc(100vh-280px)]">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectView(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-emerald-300' : 'text-emerald-700'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          isActive
                            ? 'bg-emerald-700 text-white'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Drawer Footer with Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold text-red-700 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
