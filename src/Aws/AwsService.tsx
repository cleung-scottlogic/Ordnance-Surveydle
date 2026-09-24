import type { Score } from '../Scores/Score';

const SAVE_GAME_RESULT_LAMBDA_URL = import.meta.env
  .VITE_SAVE_GAME_RESULT_LAMBDA_URL;

export class AlreadySubmittedError extends Error {
  constructor() {
    super('You have already submitted a result today');
    this.name = 'AlreadySubmittedError';
  }
}

export const saveResult = async (result: Score): Promise<void> => {
  const response = await fetch(SAVE_GAME_RESULT_LAMBDA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'http://localhost:5173',
    },
    body: JSON.stringify(result),
  });
  if (!response.ok) {
    if (response.status === 409) {
      throw new AlreadySubmittedError();
    }
    throw new Error('Failed to save game result');
  }
};

export interface LeaderboardEntry {
  player: string;
  closestDistanceMeters: number;
  guessCount: number;
  date: string;
}

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const response = await fetch(SAVE_GAME_RESULT_LAMBDA_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }
  const data = await response.json();
  return data.Items ?? [];
};

// Public S3 bucket holding the current day's seed and location objects.
export const DAILY_BUCKET_URL =
  'https://ckl-mapgame-daily-seeds-696537702940-eu-west-2-an.s3.eu-west-2.amazonaws.com';

// Public S3 object holding the current day's location as a JSON gazetteer record.
const DAILY_LOCATION_URL = `${DAILY_BUCKET_URL}/location`;

// Raw gazetteer record shape as stored in S3, before DataService maps it to DailyLocation.
export interface RawDailyLocation {
  ID: string;
  'GBPN URL': string;
  'Primary Place Name': string;
  'Grid Reference': string;
  Latitude: string;
  Longitude: string;
  Type: string;
  'Historic County': string;
  Division: string | null;
  Island: string | null;
  Townland: string | null;
  'Civil Parish': string | null;
  'Administrative County': string | null;
  District: string | null;
  'Unitary Authority Area': string | null;
  'Police Area': string | null;
  Country: string;
  Description: string | null;
}

// https://gazetteer.org.uk/contents
export const fetchDailyLocation = async (): Promise<RawDailyLocation> => {
  const response = await fetch(DAILY_LOCATION_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`location request failed: ${response.status}`);
  }
  const data = (await response.json()) as RawDailyLocation;
  if (!data || typeof data.ID !== 'string') {
    throw new Error('location missing or malformed');
  }
  return data;
};

export const AwsService = {
  saveResult,
  getLeaderboard,
  fetchDailyLocation,
};
