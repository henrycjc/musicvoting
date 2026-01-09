import { useState, useEffect, useCallback } from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { LoginForm } from './components/LoginForm';
import { BallotEditor } from './components/BallotEditor';
import { ResultsViewer } from './components/ResultsViewer';
import { ErrorBanner } from './components/ErrorBanner';
import { useAuth } from './hooks/useAuth';
import { getBallot, saveBallot, deleteBallot, getAllBallots } from './api';
import type { Ballot, BallotEntry } from './types';
import { CONFIG } from './config';

function App() {
  const { isAuthenticated, username, displayName, isLoading, error, login, logout } = useAuth();
  const [existingBallot, setExistingBallot] = useState<Ballot | null>(null);
  const [ballots, setBallots] = useState<Ballot[]>([]);
  const [isLoadingBallot, setIsLoadingBallot] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && username) {
      setIsLoadingBallot(true);
      setApiError(null);
      getBallot(username)
        .then((ballot) => {
          setExistingBallot(ballot);
        })
        .catch((err) => {
          console.error(err);
          setApiError('Failed to load ballot. Check if the backend server is running.');
        })
        .finally(() => setIsLoadingBallot(false));
    }
  }, [isAuthenticated, username]);

  useEffect(() => {
    if (isAuthenticated && selectedTab === 1) {
      setApiError(null);
      getAllBallots()
        .then(setBallots)
        .catch((err) => {
          console.error(err);
          setApiError('Failed to load results. Check if the backend server is running.');
        });
    }
  }, [isAuthenticated, selectedTab]);

  const handleSave = useCallback(
    async (entries: BallotEntry[]) => {
      if (!username) return;
      const ballot: Ballot = {
        username,
        entries,
        submittedAt: new Date().toISOString(),
      };
      const result = await saveBallot(ballot);
      if (!result.success) {
        throw new Error(result.error);
      }
      setExistingBallot(ballot);
    },
    [username]
  );

  const handleDelete = useCallback(async () => {
    if (!username || !existingBallot) return;
    const result = await deleteBallot(username);
    if (!result.success) {
      throw new Error(result.error);
    }
    // Keep the ballot data but mark as rescinded so user can edit and resubmit
    setExistingBallot({ ...existingBallot, isRescinded: true });
  }, [username, existingBallot]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <LoginForm onLogin={login} isLoading={isLoading} error={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-800/50 bg-slate-900/95 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-100">
                Warmest 70 of {CONFIG.VOTE_YEAR}
              </h1>
              <p className="text-sm text-slate-400">Logged in as {displayName || username}</p>
            </div>
            <button
              onClick={logout}
              className="rounded-xl border border-slate-600/50 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {apiError && (
          <ErrorBanner message={apiError} onDismiss={() => setApiError(null)} />
        )}
        <TabGroup selectedIndex={selectedTab} onChange={setSelectedTab}>
          <TabList className="flex space-x-1 rounded-xl bg-slate-800/50 p-1 mb-6">
            <Tab
              className={({ selected }) =>
                `w-full rounded-xl py-2.5 text-sm font-medium leading-5 transition-all ${
                  selected
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-100'
                }`
              }
            >
              My Ballot
            </Tab>
            {username?.toLowerCase() === 'hen' && (
              <Tab
                className={({ selected }) =>
                  `w-full rounded-xl py-2.5 text-sm font-medium leading-5 transition-all ${
                    selected
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-100'
                  }`
                }
              >
                Results
              </Tab>
            )}
          </TabList>

          <TabPanels>
            <TabPanel>
              {isLoadingBallot ? (
                <div className="flex items-center justify-center py-12">
                  <svg className="h-8 w-8 animate-spin text-emerald-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : (
                <BallotEditor
                  username={username!}
                  initialEntries={existingBallot?.entries}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  hasExistingBallot={!!existingBallot && !existingBallot.isRescinded}
                />
              )}
            </TabPanel>

            {username?.toLowerCase() === 'hen' && (
              <TabPanel>
                <ResultsViewer ballots={ballots} />
              </TabPanel>
            )}
          </TabPanels>
        </TabGroup>
      </main>
    </div>
  );
}

export default App;
