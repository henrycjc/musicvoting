export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: {
    id: string;
    name: string;
    images: { url: string; width: number; height: number }[];
    release_date: string;
  };
  duration_ms: number;
  preview_url: string | null;
  external_urls: { spotify: string };
}

export interface BallotEntry {
  rank: number;
  trackId: string;
  track: SpotifyTrack;
}

export interface Ballot {
  username: string;
  entries: BallotEntry[];
  submittedAt?: string;
  isRescinded?: boolean;
  rescindedAt?: string;
}

export interface User {
  username: string;
  displayName: string;
}

export interface VoteConfig {
  year: number;
  startDate: string;
  endDate: string;
  maxSongs: number;
}

export interface RankingResult {
  track: SpotifyTrack;
  score: number;
  votes: number;
  positions: number[];
}

export type RankingAlgorithm = 'borda' | 'harmonic' | 'logarithmic' | 'exponential' | 'bayesian';
