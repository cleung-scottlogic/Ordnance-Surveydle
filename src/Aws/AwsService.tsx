import type { Score } from '../Scores/Score';

const SAVE_GAME_RESULT_LAMBDA_URL = import.meta.env
  .VITE_SAVE_GAME_RESULT_LAMBDA_URL;

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
    throw new Error('Failed to save game result');
  }
};

export const AwsService = {
  saveResult,
};
