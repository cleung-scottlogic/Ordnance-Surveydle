import type { LatLng } from 'leaflet';

export class Score {
  id: string;
  player: string;
  guesses: LatLng[];
  date: Date;
  closestDistanceMeters: number;
  guessCount: number;

  constructor(
    player: string,
    guesses: LatLng[],
    date: Date,
    closestDistanceMeters: number,
  ) {
    this.id = player + date.toISOString().slice(0, 10);
    this.player = player;
    this.guesses = guesses;
    this.date = date;
    this.closestDistanceMeters = closestDistanceMeters;
    this.guessCount = guesses.length;
  }
}
