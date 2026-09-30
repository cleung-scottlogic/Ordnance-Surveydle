import { LatLng } from 'leaflet';

const DAILY_GAME_KEY = 'mapgame:dailyGame';
const PLAYER_NAME_KEY = 'mapgame:playerName';

// Persisted shape of the current day's game. It only counts as "today's" game
// while locationId matches the fetched DailyLocation, so a new day or an admin
// reroll naturally starts a fresh game.
interface StoredDailyGame {
  locationId: string;
  guesses: { lat: number; lng: number }[];
  submittedName?: string;
}

export interface DailyGame {
  guesses: LatLng[];
  submittedName?: string;
}

const readDailyGame = (): StoredDailyGame | undefined => {
  try {
    const stored = localStorage.getItem(DAILY_GAME_KEY);
    return stored === null ? undefined : (JSON.parse(stored) as StoredDailyGame);
  } catch (e) {
    console.log('readDailyGame: failed to read daily game', e);
    return undefined;
  }
};

const writeDailyGame = (game: StoredDailyGame): void => {
  try {
    localStorage.setItem(DAILY_GAME_KEY, JSON.stringify(game));
  } catch (e) {
    console.log('writeDailyGame: failed to persist daily game', e);
  }
};

export const loadDailyGame = (locationId: string): DailyGame | undefined => {
  const stored = readDailyGame();
  if (!stored || stored.locationId !== locationId) return undefined;

  return {
    guesses: (stored.guesses ?? []).map((g) => new LatLng(g.lat, g.lng)),
    submittedName: stored.submittedName,
  };
};

export const saveDailyGuesses = (locationId: string, guesses: LatLng[]): void => {
  const stored = readDailyGame();
  writeDailyGame({
    locationId,
    guesses: guesses.map((g) => ({ lat: g.lat, lng: g.lng })),
    submittedName: stored?.locationId === locationId ? stored.submittedName : undefined,
  });
};

export const markDailySubmitted = (locationId: string, name: string): void => {
  const stored = readDailyGame();
  writeDailyGame({
    locationId,
    guesses: stored?.locationId === locationId ? stored.guesses : [],
    submittedName: name,
  });
};

export const normalisePlayerName = (name: string): string => name.toLowerCase();

export const getPlayerName = (): string => {
  try {
    return localStorage.getItem(PLAYER_NAME_KEY) ?? '';
  } catch (e) {
    console.log('getPlayerName: failed to read player name', e);
    return '';
  }
};

export const setPlayerName = (name: string): void => {
  try {
    localStorage.setItem(PLAYER_NAME_KEY, name);
  } catch (e) {
    console.log('setPlayerName: failed to persist player name', e);
  }
};
