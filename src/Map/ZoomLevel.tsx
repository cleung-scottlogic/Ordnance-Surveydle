export interface ZoomLevel {
  zoom: number;
}

// max zoom level 17
// Players can always zoom back in to this level, regardless of the current guess.
export const MAX_ZOOM = 14;

// Zoom 15+ switches to the newer, more detailed sheets of the historical layer, so the game
// starts at 14.
export const ZOOM_LEVELS: ZoomLevel[] = [
  { zoom: 14 },
  { zoom: 13 },
  { zoom: 12 },
  { zoom: 11 },
  { zoom: 10 },
  { zoom: 8 },
];

// Top map pane on a 1440p screen (the game area is capped at 2560x1440, see #center in App.css):
// width is 2560 minus the 150px sidebar; height is half of (1440 - 24px padding - 8px splitter).
const REFERENCE_MAP_SIZE = { width: 2560 - 150, height: (1440 - 24 - 8) / 2 };
const BOUNDS_PADDING = 0.5;

// Pan limit in screen pixels at each level's zoom: 50% more than the 1440p view, the same on
// every device, so smaller screens can pan further relative to their view.
export const HISTORICAL_BOUNDS_SIZE = {
  width: REFERENCE_MAP_SIZE.width * (1 + BOUNDS_PADDING),
  height: REFERENCE_MAP_SIZE.height * (1 + BOUNDS_PADDING),
};
