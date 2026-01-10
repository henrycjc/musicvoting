import { useState } from 'react';
import { USERS, getVotePeriodLabel } from '../config';

interface LoginFormProps {
  onLogin: (username: string, pin: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

// Calculate font size based on name length
function getNameFontSize(name: string): string {
  const len = name.length;
  if (len <= 3) return 'text-lg';
  if (len <= 5) return 'text-base';
  if (len <= 7) return 'text-sm';
  return 'text-xs';
}

export function LoginForm({ onLogin, isLoading, error }: LoginFormProps) {
  const [selectedUser, setSelectedUser] = useState<(typeof USERS)[number] | null>(null);
  const [pin, setPin] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !pin.trim()) {
      return;
    }
    await onLogin(selectedUser.username, pin);
  };

  const handleUserSelect = (user: (typeof USERS)[number]) => {
    setSelectedUser(user);
    setPin('');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <img src="/image.png" alt="" className="h-12 w-12 md:h-16 md:w-16" />
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 tracking-tight">
            Warmest 70
          </h1>
        </div>
        <p className="text-xl md:text-2xl font-bold text-amber-400 tracking-widest">
          {getVotePeriodLabel()}
        </p>
        <p className="text-slate-400 mt-2 text-lg">Choose Your Player</p>
      </div>

      {/* Selected Fighter Preview */}
      <div className="mb-8 flex justify-center">
        <div className="relative">
          {selectedUser ? (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur-lg opacity-60" />
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-slate-800/80 border-2 border-white/20 shadow-2xl flex flex-col items-center justify-center">
                  <span className="text-6xl md:text-7xl">{selectedUser.emoji}</span>
                  <span className={`font-bold text-slate-100 mt-1 ${getNameFontSize(selectedUser.displayName)}`}>
                    {selectedUser.displayName}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-2xl md:text-3xl font-black text-slate-100 tracking-wide">
                {selectedUser.displayName.toUpperCase()}
              </p>
              <p className="text-emerald-400 text-sm font-medium">READY TO VOTE!</p>
            </div>
          ) : (
            <div className="flex flex-col items-center opacity-50">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-slate-800/60 border-2 border-dashed border-slate-600 flex items-center justify-center">
                <span className="text-4xl text-slate-600">?</span>
              </div>
              <p className="mt-4 text-2xl md:text-3xl font-black text-slate-600 tracking-wide">
                SELECT PLAYER
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Character Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 md:gap-3 mb-8">
        {USERS.map((user) => (
          <button
            key={user.username}
            onClick={() => handleUserSelect(user)}
            className={`group relative aspect-square rounded-xl overflow-hidden transition-all duration-200 bg-slate-800/60 flex flex-col items-center justify-center ${
              selectedUser?.username === user.username
                ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 scale-110 z-10 shadow-lg shadow-emerald-500/20'
                : 'hover:scale-105 hover:bg-slate-700/60'
            }`}
          >
            {/* Emoji avatar */}
            <span className="text-3xl md:text-4xl">{user.emoji}</span>
            {/* Name below emoji */}
            <span className={`font-bold text-slate-100 mt-1 ${getNameFontSize(user.displayName)}`}>
              {user.displayName}
            </span>
            {/* Selection Indicator */}
            {selectedUser?.username === user.username && (
              <div className="absolute top-1 right-1">
                <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Login Form (appears when user selected) */}
      {selectedUser && (
        <div className="max-w-sm mx-auto animate-in slide-in-from-bottom duration-300">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full rounded-xl border border-slate-600/50 bg-slate-800/60 px-4 py-4 text-center text-xl font-bold text-slate-100 placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 tracking-widest transition-all"
                placeholder="ENTER PIN"
                autoComplete="off"
                autoFocus
              />
            </div>

            {error && (
              <div className="rounded-xl bg-rose-900/30 border border-rose-500/50 p-3 animate-in shake duration-300">
                <p className="text-sm text-rose-300 text-center font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !pin.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-4 font-black text-xl text-white uppercase tracking-wider hover:from-emerald-400 hover:to-teal-400 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  LOADING...
                </span>
              ) : (
                'START VOTING!'
              )}
            </button>
          </form>

          <button
            onClick={() => setSelectedUser(null)}
            className="w-full mt-3 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors"
          >
            Back to Character Select
          </button>
        </div>
      )}

      {/* Footer hint */}
      {!selectedUser && (
        <p className="text-center text-slate-600 text-sm">
          Click on a character to select
        </p>
      )}
    </div>
  );
}
