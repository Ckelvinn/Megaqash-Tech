import React, { useState } from 'react';
import { Shield, KeyRound, X, AlertCircle, ArrowRight } from 'lucide-react';
import { ADMIN_PASSWORD, setAdminLoggedIn } from '../services/storage';

interface SecretAdminTriggerProps {
  onAdminLogin: () => void;
}

export const SecretAdminTrigger: React.FC<SecretAdminTriggerProps> = ({ onAdminLogin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setError('');
      setAdminLoggedIn(true);
      setIsOpen(false);
      onAdminLogin();
    } else {
      setError('Incorrect admin authorization key. Access denied.');
    }
  };

  return (
    <>
      {/* Big MQ Icon in top right */}
      <button
        onClick={() => {
          setIsOpen(true);
          setError('');
          setPassword('');
        }}
        title="MegaQash Master Control"
        className="group relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-emerald-900 text-emerald-100 shadow-lg hover:shadow-emerald-900/30 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-emerald-400/40 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 z-30"
        aria-label="Admin Access"
      >
        <div className="flex flex-col items-center justify-center leading-none">
          <span className="font-extrabold text-xl md:text-2xl tracking-tighter text-emerald-300 group-hover:text-white transition-colors">
            MQ
          </span>
          <span className="text-[9px] font-semibold tracking-widest uppercase text-emerald-400/80">
            SECURE
          </span>
        </div>
      </button>

      {/* Secret Password Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-emerald-200 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-900 flex items-center justify-center text-emerald-300 font-bold text-xl">
                MQ
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">MegaQash Master Console</h3>
                <p className="text-xs text-slate-500">Authorized administrative access only</p>
              </div>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Admin Passkey
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter security password"
                    autoFocus
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900 font-mono"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-all shadow-sm"
                >
                  <Shield className="w-4 h-4" />
                  <span>Authenticate</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
