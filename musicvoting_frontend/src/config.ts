export const CONFIG = {
  SPOTIFY_API_URL: import.meta.env.VITE_SPOTIFY_API_URL || 'http://localhost:3001',
  BALLOT_API_URL: import.meta.env.VITE_BALLOT_API_URL || 'http://localhost:3002',
  VOTE_YEAR: 2025,
  VOTE_START_DATE: '2025-01-01',
  VOTE_END_DATE: '2025-12-31',
  MAX_SONGS: 20,
  LOCAL_STORAGE_KEY: 'musicvoting_ballot_draft',
  LOCAL_STORAGE_RESTORED_KEY: 'musicvoting_restored_from_local',
};

// Hardcoded users - login is case-insensitive for both username and PIN
export const USERS: { username: string; displayName: string; pin: string }[] = [
  { username: 'aidan', displayName: 'Aidan', pin: 'bowie' },
  { username: 'aleesha', displayName: 'Aleesha', pin: 'cher' },
  { username: 'alisha', displayName: 'Alisha', pin: 'adele' },
  { username: 'andyr', displayName: 'Andy R', pin: 'prince' },
  { username: 'andym', displayName: 'Andy M', pin: 'drake' },
  { username: 'annika', displayName: 'Annika', pin: 'bjork' },
  { username: 'beulah', displayName: 'Beulah', pin: 'madonna' },
  { username: 'cathy', displayName: 'Cathy', pin: 'beyonce' },
  { username: 'charlie', displayName: 'Charlie', pin: 'coldplay' },
  { username: 'danielle', displayName: 'Danielle', pin: 'sia' },
  { username: 'dave', displayName: 'Dave', pin: 'oasis' },
  { username: 'dec', displayName: 'Dec', pin: 'nirvana' },
  { username: 'dom', displayName: 'Dom', pin: 'radiohead' },
  { username: 'jake', displayName: 'Jake', pin: 'blur' },
  { username: 'ella', displayName: 'Ella', pin: 'lorde' },
  { username: 'emily', displayName: 'Emily', pin: 'rihanna' },
  { username: 'erin', displayName: 'Erin', pin: 'abba' },
  { username: 'graham', displayName: 'Graham', pin: 'queen' },
  { username: 'hellen', displayName: 'Hellen', pin: 'fleetwood' },
  { username: 'hen', displayName: 'Hen', pin: 'zeppelin' },
  { username: 'josh', displayName: 'Josh', pin: 'toto' },
  { username: 'josie', displayName: 'Josie', pin: 'blondie' },
  { username: 'louis', displayName: 'Louis', pin: 'daft' },
  { username: 'luke', displayName: 'Luke', pin: 'gorillaz' },
  { username: 'matthew', displayName: 'Matthew', pin: 'muse' },
  { username: 'max', displayName: 'Max', pin: 'acdc' },
  { username: 'nat', displayName: 'Nat', pin: 'pink' },
  { username: 'natasha', displayName: 'Natasha', pin: 'shakira' },
  { username: 'nikola', displayName: 'Nikola', pin: 'tesla' },
  { username: 'peter', displayName: 'Peter', pin: 'genesis' },
  { username: 'sarah', displayName: 'Sarah', pin: 'flume' },
  { username: 'sean', displayName: 'Sean', pin: 'arctic' },
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
