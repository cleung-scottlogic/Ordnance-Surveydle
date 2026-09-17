import type { LatLng } from 'leaflet';

export class Score {
  id: string;
  player: string;
  guesses: LatLng[];
  date: Date;

  constructor(player: string, guesses: LatLng[], date: Date) {
    this.id = player + date.toISOString();
    this.player = player;
    this.guesses = guesses;
    this.date = date;
  }
}
