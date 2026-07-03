/**
 * Scoring service for calculating guess accuracy scores.
 *
 * Scoring rules:
 * - 0-100 meters: 1000 points (perfect)
 * - 100 meters - 300 km: Linear interpolation from 1000 to 0
 * - 300+ km: 0 points
 */

import type { LatLng } from 'leaflet';

const PERFECT_DISTANCE_M = 100; // 100 meters
const ZERO_DISTANCE_M = 300000; // 300 km in meters
const MAX_SCORE = 1000;
const MIN_SCORE = 0;

/**
 * Calculate the distance in meters between a guess and the answer location.
 * @returns Distance in meters, or undefined if either location is missing.
 */
export function getDistanceMeters(guess?: LatLng, answer?: LatLng): number | undefined {
  if (!guess || !answer) return undefined;
  try {
    return guess.distanceTo(answer);
  } catch (e) {
    console.log('getDistanceMeters: failed to calculate distance', e);
    return undefined;
  }
}

/**
 * Calculate the distance in kilometers between a guess and the answer location.
 * @returns Distance in kilometers, or undefined if either location is missing.
 */
export function getDistanceKm(guess?: LatLng, answer?: LatLng): number | undefined {
  const meters = getDistanceMeters(guess, answer);
  return meters !== undefined ? meters / 1000 : undefined;
}

/**
 * Calculate score for a guess based on distance from the correct location.
 * @param distanceMeters - Distance in meters between guess and correct location
 * @returns Score from 0-1000
 */
export function calculateScore(distanceMeters: number): number {
  if (distanceMeters <= PERFECT_DISTANCE_M) {
    return MAX_SCORE;
  }

  if (distanceMeters >= ZERO_DISTANCE_M) {
    return MIN_SCORE;
  }

  // Linear interpolation between perfect and zero distance
  const rangeDistance = ZERO_DISTANCE_M - PERFECT_DISTANCE_M;
  const distanceInRange = distanceMeters - PERFECT_DISTANCE_M;
  const ratio = distanceInRange / rangeDistance;
  const score = MAX_SCORE * (1 - ratio);

  return Math.round(score);
}

/**
 * Calculate the score for a guess directly from two locations.
 * @returns Score from 0-1000, or undefined if either location is missing.
 */
export function getScoreForGuess(guess?: LatLng, answer?: LatLng): number | undefined {
  const meters = getDistanceMeters(guess, answer);
  return meters !== undefined ? calculateScore(meters) : undefined;
}

export default {
  calculateScore,
  getDistanceMeters,
  getDistanceKm,
  getScoreForGuess,
};
