import { useState } from 'react';
import { USERS } from '../config';

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
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 mb-2 tracking-tight">
          Warmest 70
        </h1>
        <p className="text-xl md:text-2xl font-bold text-yellow-400 tracking-widest">
          {new Date().getFullYear()}
        </p>
        <p className="text-gray-400 mt-2 text-lg">Choose Your Player</p>
      </div>

      {/* Selected Fighter Preview */}
      <div className="mb-8 flex justify-center">
        <div className="relative">
          {selectedUser ? (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-75 animate-pulse" />
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-xl bg-gray-800 border-4 border-white shadow-2xl flex flex-col items-center justify-center">
                  <span className="text-6xl md:text-7xl">{selectedUser.emoji}</span>
                  <span className={`font-bold text-white mt-1 ${getNameFontSize(selectedUser.displayName)}`}>
                    {selectedUser.displayName}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-2xl md:text-3xl font-black text-white tracking-wide">
                {selectedUser.displayName.toUpperCase()}
              </p>
              <p className="text-green-400 text-sm font-medium">READY TO VOTE!</p>
            </div>
          ) : (
            <div className="flex flex-col items-center opacity-50">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-gray-800 border-4 border-dashed border-gray-600 flex items-center justify-center">
                <span className="text-4xl text-gray-600">?</span>
              </div>
              <p className="mt-4 text-2xl md:text-3xl font-black text-gray-600 tracking-wide">
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
            className={`group relative aspect-square rounded-lg overflow-hidden transition-all duration-200 bg-gray-800 flex flex-col items-center justify-center ${
              selectedUser?.username === user.username
                ? 'ring-4 ring-green-500 ring-offset-2 ring-offset-gray-900 scale-110 z-10'
                : 'hover:scale-105 hover:ring-2 hover:ring-white/50'
            }`}
          >
            {/* Emoji avatar */}
            <span className="text-3xl md:text-4xl">{user.emoji}</span>
            {/* Name below emoji */}
            <span className={`font-bold text-white mt-1 ${getNameFontSize(user.displayName)}`}>
              {user.displayName}
            </span>
            {/* Selection Indicator */}
            {selectedUser?.username === user.username && (
              <div className="absolute top-1 right-1">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-ping" />
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full" />
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
                className="w-full rounded-xl border-2 border-gray-700 bg-gray-800/80 backdrop-blur px-4 py-4 text-center text-xl font-bold text-white placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 tracking-widest"
                placeholder="ENTER PIN"
                autoComplete="off"
                autoFocus
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-900/50 border-2 border-red-500 p-3 animate-in shake duration-300">
                <p className="text-sm text-red-300 text-center font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !pin.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-4 font-black text-xl text-white uppercase tracking-wider hover:from-green-500 hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-green-600 disabled:hover:to-emerald-600 transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/50"
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
            className="w-full mt-3 text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors"
          >
            Back to Character Select
          </button>
        </div>
      )}

      {/* Footer hint */}
      {!selectedUser && (
        <p className="text-center text-gray-600 text-sm">
          Click on a character to select
        </p>
      )}
    </div>
  );
}
