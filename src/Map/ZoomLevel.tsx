export interface ZoomLevel {
  zoom: number;
  boundsFactor: number;
}

// max zoom level 17
// Players can always zoom back in to this level, regardless of the current guess.
export const MAX_ZOOM = 14;

// Zoom 15+ switches to the newer, more detailed sheets of the historical layer, so the game
// starts at 14.
// boundsFactor * 4 is the half-width of the pan box in degrees. Zoom 14 is sized so the box is
// 2880px wide (2 * 4 * 0.0309 * 256 * 2^14 / 360). Each level doubles the factor per zoom step
// (0.0309 * 2^(14 - zoom)), so the box stays 2880px wide on screen at every level while covering
// more ground.
export const ZOOM_LEVELS: ZoomLevel[] = [
  { zoom: 14, boundsFactor: 0.0309 },
  { zoom: 13, boundsFactor: 0.0618 },
  { zoom: 12, boundsFactor: 0.1236 },
  { zoom: 11, boundsFactor: 0.2472 },
  { zoom: 10, boundsFactor: 0.4944 },
  { zoom: 8, boundsFactor: 1.9776 },
];
