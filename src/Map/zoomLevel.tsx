interface ZoomLevel {
  zoom: number;
  boundsFactor: number;
}

interface ZoomLevels {
  one: ZoomLevel;
  two: ZoomLevel;
  three: ZoomLevel;
  four: ZoomLevel;
  five: ZoomLevel;
}

export const zoomLevels: ZoomLevels = {
  one: { zoom: 17, boundsFactor: 0.006 },
  two: { zoom: 15, boundsFactor: 0.012 },
  three: { zoom: 13, boundsFactor: 0.024 },
  four: { zoom: 11, boundsFactor: 0.048 },
  five: { zoom: 9, boundsFactor: 0.096 },
};
