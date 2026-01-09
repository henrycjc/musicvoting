import { useState, useMemo } from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import type { Ballot, RankingResult, RankingAlgorithm, SpotifyTrack } from '../types';
import { CONFIG } from '../config';

interface ResultsViewerProps {
  ballots: Ballot[];
}

function calculateRankings(
  ballots: Ballot[],
  algorithm: RankingAlgorithm
): RankingResult[] {
  const trackScores = new Map<string, { track: SpotifyTrack; score: number; votes: number; positions: number[] }>();

  for (const ballot of ballots) {
    for (const entry of ballot.entries) {
      const existing = trackScores.get(entry.trackId);
      let score: number;

      switch (algorithm) {
        case 'borda':
          score = CONFIG.MAX_SONGS - entry.rank + 1;
          break;
        case 'harmonic':
          score = 1 / entry.rank;
          break;
        case 'logarithmic':
          score = Math.log2(CONFIG.MAX_SONGS + 2 - entry.rank);
          break;
        case 'exponential':
          score = Math.pow(2, CONFIG.MAX_SONGS - entry.rank);
          break;
        case 'bayesian':
          score = (CONFIG.MAX_SONGS - entry.rank + 1) / CONFIG.MAX_SONGS;
          break;
        default:
          score = CONFIG.MAX_SONGS - entry.rank + 1;
      }

      if (existing) {
        existing.score += score;
        existing.votes += 1;
        existing.positions.push(entry.rank);
      } else {
        trackScores.set(entry.trackId, {
          track: entry.track,
          score,
          votes: 1,
          positions: [entry.rank],
        });
      }
    }
  }

  return Array.from(trackScores.values())
    .sort((a, b) => b.score - a.score)
    .map((item) => ({
      ...item,
      score: Math.round(item.score * 100) / 100,
    }));
}

const ALGORITHMS: { id: RankingAlgorithm; name: string; description: string }[] = [
  { id: 'borda', name: 'Borda Count', description: 'Linear scoring (1st=20pts, 20th=1pt). Fair and balanced - every position matters equally in terms of point difference.' },
  { id: 'harmonic', name: 'Harmonic', description: 'Strong top bias (1st=1pt, 2nd=0.5pt, 10th=0.1pt). Your #1 pick is worth as much as picks #2-20 combined.' },
  { id: 'logarithmic', name: 'Logarithmic', description: 'Moderate top bias using log2 scale. Top 5 picks carry most weight, but lower ranks still contribute meaningfully.' },
  { id: 'exponential', name: 'Exponential', description: 'Extreme top bias (1st=524k pts, 2nd=262k pts). Your #1 pick completely dominates - great for finding consensus favorites.' },
  { id: 'bayesian', name: 'Bayesian', description: 'Normalized 0-1 scale (1st=1.0, 20th=0.05). Same as Borda but scaled for easier interpretation.' },
];

export function ResultsViewer({ ballots }: ResultsViewerProps) {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<RankingAlgorithm>('borda');

  const rankings = useMemo(
    () => calculateRankings(ballots, selectedAlgorithm),
    [ballots, selectedAlgorithm]
  );

  const voterStats = useMemo(() => {
    return {
      totalVoters: ballots.length,
      uniqueTracks: new Set(ballots.flatMap((b) => b.entries.map((e) => e.trackId))).size,
    };
  }, [ballots]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
          <p className="text-sm text-gray-400">Total Voters</p>
          <p className="text-2xl font-bold text-white">{voterStats.totalVoters}</p>
        </div>
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
          <p className="text-sm text-gray-400">Unique Tracks</p>
          <p className="text-2xl font-bold text-white">{voterStats.uniqueTracks}</p>
        </div>
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
          <p className="text-sm text-gray-400">Total Votes</p>
          <p className="text-2xl font-bold text-white">{ballots.length * CONFIG.MAX_SONGS}</p>
        </div>
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
          <p className="text-sm text-gray-400">Algorithm</p>
          <p className="text-2xl font-bold text-green-400">{ALGORITHMS.find((a) => a.id === selectedAlgorithm)?.name}</p>
        </div>
      </div>

      <TabGroup>
        <TabList className="flex space-x-1 rounded-lg bg-gray-800 p-1">
          {ALGORITHMS.map((algo) => (
            <Tab
              key={algo.id}
              onClick={() => setSelectedAlgorithm(algo.id)}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors ${
                  selected
                    ? 'bg-green-600 text-white shadow'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              {algo.name}
            </Tab>
          ))}
        </TabList>
        <TabPanels className="mt-4">
          {ALGORITHMS.map((algo) => (
            <TabPanel key={algo.id}>
              <p className="mb-4 text-sm text-gray-400">{algo.description}</p>
            </TabPanel>
          ))}
        </TabPanels>
      </TabGroup>

      {rankings.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-700 p-8 text-center">
          <p className="text-gray-400">No votes submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rankings.slice(0, 100).map((result, index) => (
            <div
              key={result.track.id}
              className={`flex items-center gap-4 rounded-lg border p-4 ${
                index < 3
                  ? 'border-yellow-500/50 bg-yellow-900/20'
                  : 'border-gray-700 bg-gray-800'
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                  index === 0
                    ? 'bg-yellow-500 text-black'
                    : index === 1
                    ? 'bg-gray-300 text-black'
                    : index === 2
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                {index + 1}
              </div>

              {result.track.album.images[2] && (
                <img
                  src={result.track.album.images[2].url}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded"
                />
              )}

              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-white">{result.track.name}</p>
                <p className="truncate text-sm text-gray-400">
                  {result.track.artists.map((a) => a.name).join(', ')}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-green-400">{result.score}</p>
                <p className="text-xs text-gray-500">
                  {result.votes} vote{result.votes !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="hidden md:block shrink-0 w-32">
                <p className="text-xs text-gray-500">Positions</p>
                <p className="text-sm text-gray-400">
                  {result.positions.sort((a, b) => a - b).slice(0, 5).join(', ')}
                  {result.positions.length > 5 ? '...' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-gray-700 pt-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Individual Ballots</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ballots.map((ballot) => (
            <div key={ballot.username} className="rounded-lg border border-gray-700 bg-gray-800 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-medium text-white">{ballot.username}</h4>
                {ballot.submittedAt && (
                  <span className="text-xs text-gray-500">
                    {new Date(ballot.submittedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <ol className="space-y-1 text-sm">
                {ballot.entries.slice(0, 5).map((entry) => (
                  <li key={entry.trackId} className="flex items-center gap-2 text-gray-300">
                    <span className="w-5 text-gray-500">{entry.rank}.</span>
                    <span className="truncate">{entry.track.name}</span>
                  </li>
                ))}
                {ballot.entries.length > 5 && (
                  <li className="text-gray-500">...and {ballot.entries.length - 5} more</li>
                )}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
