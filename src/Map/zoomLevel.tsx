export interface ZoomLevel {
  zoom: number;
  boundsFactor: number;
}

export const ZOOM_LEVELS: ZoomLevel[] = [
  { zoom: 17, boundsFactor: 0.006 },
  { zoom: 15, boundsFactor: 0.012 },
  { zoom: 13, boundsFactor: 0.024 },
  { zoom: 11, boundsFactor: 0.048 },
  { zoom: 9, boundsFactor: 0.096 },
  { zoom: 8, boundsFactor: 0.18 },
];
