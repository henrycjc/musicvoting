import { CONFIG } from './config';
import type { SpotifyTrack, Ballot } from './types';

export async function searchTracks(query: string): Promise<SpotifyTrack[]> {
  const response = await fetch(
    `${CONFIG.SPOTIFY_API_URL}/search?q=${encodeURIComponent(query)}`
  );
  if (!response.ok) {
    throw new Error('Failed to search tracks');
  }
  const data = await response.json();
  return data.tracks;
}

export async function getBallot(username: string): Promise<Ballot | null> {
  const response = await fetch(`${CONFIG.BALLOT_API_URL}/ballot/${username}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Failed to get ballot');
  }
  return response.json();
}

export async function saveBallot(
  ballot: Ballot
): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`${CONFIG.BALLOT_API_URL}/ballot`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ballot),
  });
  return response.json();
}

export async function deleteBallot(
  username: string
): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`${CONFIG.BALLOT_API_URL}/ballot/${username}`, {
    method: 'DELETE',
  });
  return response.json();
}

export async function getAllBallots(): Promise<Ballot[]> {
  const response = await fetch(`${CONFIG.BALLOT_API_URL}/admin/ballots`);
  if (!response.ok) {
    throw new Error('Failed to get ballots');
  }
  return response.json();
}
