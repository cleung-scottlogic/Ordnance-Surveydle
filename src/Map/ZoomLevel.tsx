export interface ZoomLevel {
  zoom: number;
  boundsFactor: number;
}

// max zoom level 17
// Players can always zoom back in to this level, regardless of the current guess.
export const MAX_ZOOM = 14;

// Zoom 15+ switches to the newer, more detailed sheets of the historical layer, so the game
// starts at 14. Bounds grow faster than the view zooms out, so each guess also gives a larger
// pan window.
export const ZOOM_LEVELS: ZoomLevel[] = [
  { zoom: 14, boundsFactor: 0.006 },
  { zoom: 13, boundsFactor: 0.015 },
  { zoom: 12, boundsFactor: 0.036 },
  { zoom: 11, boundsFactor: 0.09 },
  { zoom: 10, boundsFactor: 0.22 },
  { zoom: 8, boundsFactor: 1 },
];
