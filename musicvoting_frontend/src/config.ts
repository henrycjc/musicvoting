export const CONFIG = {
  SPOTIFY_API_URL: import.meta.env.VITE_SPOTIFY_API_URL || 'http://localhost:3001',
  BALLOT_API_URL: import.meta.env.VITE_BALLOT_API_URL || 'http://localhost:3002',
  VOTE_START_YEAR: 2015,
  VOTE_END_YEAR: 2025,
  VOTE_START_DATE: '2015-01-01',
  VOTE_END_DATE: '2025-12-31',
  MAX_SONGS: 20,
  LOCAL_STORAGE_KEY: 'musicvoting_ballot_draft',
  LOCAL_STORAGE_RESTORED_KEY: 'musicvoting_restored_from_local',
};

// Helper to get the display label for the voting period
export function getVotePeriodLabel(): string {
  if (CONFIG.VOTE_START_YEAR === CONFIG.VOTE_END_YEAR) {
    return `${CONFIG.VOTE_START_YEAR}`;
  }
  return `${CONFIG.VOTE_START_YEAR}-${CONFIG.VOTE_END_YEAR}`;
}

// Hardcoded users - login is case-insensitive for both username and PIN
// Each user has a unique emoji avatar
export const USERS: { username: string; displayName: string; pin: string; emoji: string }[] = [
  { username: 'aidan', displayName: 'Aidan', pin: 'bowie', emoji: '🦊' },
  { username: 'aleesha', displayName: 'Aleesha', pin: 'cher', emoji: '🦋' },
  { username: 'alisha', displayName: 'Alisha', pin: 'adele', emoji: '🌸' },
  { username: 'andyr', displayName: 'Andy R', pin: 'prince', emoji: '🎸' },
  { username: 'andym', displayName: 'Andy M', pin: 'drake', emoji: '🐉' },
  { username: 'annika', displayName: 'Annika', pin: 'bjork', emoji: '❄️' },
  { username: 'beulah', displayName: 'Beulah', pin: 'madonna', emoji: '🌻' },
  { username: 'cathy', displayName: 'Cathy', pin: 'beyonce', emoji: '🐱' },
  { username: 'charlie', displayName: 'Charlie', pin: 'coldplay', emoji: '🌈' },
  { username: 'danielle', displayName: 'Danielle', pin: 'sia', emoji: '🦩' },
  { username: 'dave', displayName: 'Dave', pin: 'oasis', emoji: '🏔️' },
  { username: 'dec', displayName: 'Dec', pin: 'nirvana', emoji: '🎯' },
  { username: 'dom', displayName: 'Dom', pin: 'radiohead', emoji: '🎧' },
  { username: 'jake', displayName: 'Jake', pin: 'blur', emoji: '🛹' },
  { username: 'ella', displayName: 'Ella', pin: 'lorde', emoji: '✨' },
  { username: 'emily', displayName: 'Emily', pin: 'rihanna', emoji: '💎' },
  { username: 'erin', displayName: 'Erin', pin: 'abba', emoji: '🌊' },
  { username: 'graham', displayName: 'Graham', pin: 'queen', emoji: '🦁' },
  { username: 'hellen', displayName: 'Hellen', pin: 'fleetwood', emoji: '🌙' },
  { username: 'hen', displayName: 'Hen', pin: 'zeppelin', emoji: '🐔' },
  { username: 'josh', displayName: 'Josh', pin: 'toto', emoji: '🎺' },
  { username: 'josie', displayName: 'Josie', pin: 'blondie', emoji: '🌟' },
  { username: 'louis', displayName: 'Louis', pin: 'daft', emoji: '🤖' },
  { username: 'luke', displayName: 'Luke', pin: 'gorillaz', emoji: '🦍' },
  { username: 'matthew', displayName: 'Matthew', pin: 'muse', emoji: '🚀' },
  { username: 'max', displayName: 'Max', pin: 'acdc', emoji: '⚡' },
  { username: 'nat', displayName: 'Nat', pin: 'pink', emoji: '🎀' },
  { username: 'natasha', displayName: 'Natasha', pin: 'shakira', emoji: '💃' },
  { username: 'nikola', displayName: 'Nikola', pin: 'tesla', emoji: '🔌' },
  { username: 'nico', displayName: 'Nico', pin: 'simone', emoji: '🍄' },
  { username: 'patience', displayName: 'Patience', pin: 'grates', emoji: '🀄' },
  { username: 'peter', displayName: 'Peter', pin: 'genesis', emoji: '🐺' },
  { username: 'sarah', displayName: 'Sarah', pin: 'flume', emoji: '🥁' },
  { username: 'sean', displayName: 'Sean', pin: 'arctic', emoji: '🐧' },
];

export function validateUser(
  username: string,
  pin: string
): { valid: boolean; username?: string; displayName?: string } {
  const normalizedUsername = username.toLowerCase().trim();
  const normalizedPin = pin.toLowerCase().trim();

  const user = USERS.find((u) => u.username === normalizedUsername);
  if (!user) return { valid: false };
  if (user.pin.toLowerCase() !== normalizedPin) return { valid: false };

  return { valid: true, username: user.username, displayName: user.displayName };
}
