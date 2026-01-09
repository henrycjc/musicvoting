import { useState } from 'react';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { USERS } from '../config';

interface LoginFormProps {
  onLogin: (username: string, pin: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function LoginForm({ onLogin, isLoading, error }: LoginFormProps) {
  const [selectedUser, setSelectedUser] = useState(USERS[0]);
  const [pin, setPin] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      return;
    }
    await onLogin(selectedUser.username, pin);
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-xl">
        <h2 className="mb-6 text-center text-2xl font-bold text-white">
          Music Voting {new Date().getFullYear()}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Select User
            </label>
            <Listbox value={selectedUser} onChange={setSelectedUser}>
              <div className="relative">
                <ListboxButton className="relative w-full cursor-pointer rounded-lg border border-gray-600 bg-gray-700 py-3 pl-4 pr-10 text-left text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500">
                  <span className="block truncate">{selectedUser.displayName}</span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </ListboxButton>

                <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-600 bg-gray-700 py-1 shadow-lg focus:outline-none">
                  {USERS.map((user) => (
                    <ListboxOption
                      key={user.username}
                      value={user}
                      className={({ active }) =>
                        `cursor-pointer px-4 py-2 ${active ? 'bg-green-600 text-white' : 'text-gray-200'}`
                      }
                    >
                      {({ selected }) => (
                        <span className={`block truncate ${selected ? 'font-semibold' : ''}`}>
                          {user.displayName}
                        </span>
                      )}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            </Listbox>
          </div>

          <div>
            <label htmlFor="pin" className="mb-2 block text-sm font-medium text-gray-300">
              PIN Code
            </label>
            <input
              type="password"
              id="pin"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="Enter your PIN"
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-900/50 border border-red-500 p-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !pin.trim()}
            className="w-full rounded-lg bg-green-600 py-3 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
