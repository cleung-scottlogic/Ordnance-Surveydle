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

export const AwsService = {
  saveResult,
  getLeaderboard,
};
