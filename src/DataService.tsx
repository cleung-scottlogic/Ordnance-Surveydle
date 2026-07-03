// import OsGridRef from "https://cdn.jsdelivr.net/npm/geodesy@2/osgridref.js?url";
// @ts-expect-error
import OsGridRef from 'geodesy/osgridref';

interface DataService {
  osmTileLayer: string;
  osmAttribution: string;
  historicalTileLayer: string;
  historicalTileLayerKey: string;
  historicalAttribution: string;
}

interface StartingLocation {
  date: Date;
  gridReference: string;
  easting: string;
  northing: string;
  lat: number;
  lng: number;
  seed?: number;
}

export const DataService: DataService = {
  osmTileLayer: import.meta.env.VITE_OSM_TILELAYER,
  osmAttribution: `&copy; <a href="${import.meta.env.VITE_OSM_ATTRIBUTION}">OpenStreetMap</a> contributors`,
  historicalTileLayer: import.meta.env.VITE_HISTORICAL_TILELAYER,
  // TODO: DELETE AND CREATE NEW KEY FOR VAULT
  historicalTileLayerKey: 'fIGLURh5nxHfE0ydIxke',
  historicalAttribution: `<a href="${import.meta.env.VITE_HISTORICAL_ATTRIBUTION}">National Library of Scotland</a>`,
};

// alternative generation: list of towns and villages converted to grid refernec with random amount added
export const getStartinglocation = (): StartingLocation => {
  // prettier-ignore
  const osGridSquares = [
    "HU","NC","NG","NH",
    "NJ","NO","NN","NM","NR","NS","NT","NZ",
    "NY","NX","NY","NZ","SE","SD","SH",
    "SJ","SK","TF","SN","SO","SP","TL",
    "TM","TQ","SU","ST","SS","SX"

  ]

  // grid references that contain too much sea
  // ,"HY",,"ND","NB",,"NF","TA","TG","TR","SW",    "NU"

  const getRandomThreeDigitNumber = (): string => {
    const value = Math.floor(Math.random() * 999);

    return value.toString().padStart(3, '0');
  };

  const gridReference: string = osGridSquares[Math.floor(Math.random() * osGridSquares.length)];
  const easting = getRandomThreeDigitNumber();
  const northing = getRandomThreeDigitNumber();

  const gridRef = OsGridRef.parse(gridReference + easting + northing);
  const wgs84 = gridRef.toLatLon();
  const lat: number = wgs84._lat;
  const lng: number = wgs84._lon;

  return {
    date: new Date(),
    gridReference,
    easting,
    northing,
    lat,
    lng,
  };
};

const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const SEED_OFFSET_KEY = 'mapgame:seedOffset';

export const getSeedOffset = (): number => {
  try {
    const stored = localStorage.getItem(SEED_OFFSET_KEY);
    const parsed = stored === null ? 0 : parseInt(stored, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch (e) {
    console.log('getSeedOffset: failed to read seed offset', e);
    return 0;
  }
};

export const setSeedOffset = (offset: number): void => {
  try {
    localStorage.setItem(SEED_OFFSET_KEY, String(offset));
  } catch (e) {
    console.log('setSeedOffset: failed to persist seed offset', e);
  }
};

export const incrementSeedOffset = (): number => {
  const next = getSeedOffset() + 1;
  setSeedOffset(next);
  return next;
};

// Compute the deterministic base seed for the current UK day.
export const getDailyBaseSeed = (ukDate: Date): number => {
  const dateString = `${ukDate.getFullYear()}-${ukDate.getMonth() + 1}-${ukDate.getDate()}`;
  return dateString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
};

// Generate a starting location deterministically from a seed value.
export const getStartingLocationFromSeed = (seed: number, date: Date): StartingLocation => {
  // prettier-ignore
  const osGridSquares = [
    "HU","NC","NG","NH",
    "NJ","NO","NN","NM","NR","NS","NT","NZ",
    "NY","NX","NY","NZ","SE","SD","SH",
    "SJ","SK","TF","SN","SO","SP","TL",
    "TM","TQ","SU","ST","SS","SX"
  ];

  const gridIndex = Math.floor(seededRandom(seed) * osGridSquares.length);
  const eastingSeed = seed + 1;
  const northingSeed = seed + 2;

  const easting = Math.floor(seededRandom(eastingSeed) * 999)
    .toString()
    .padStart(3, '0');
  const northing = Math.floor(seededRandom(northingSeed) * 999)
    .toString()
    .padStart(3, '0');

  const gridReference = osGridSquares[gridIndex];
  const gridRef = OsGridRef.parse(gridReference + easting + northing);
  const wgs84 = gridRef.toLatLon();

  return {
    date,
    gridReference,
    easting,
    northing,
    lat: wgs84._lat,
    lng: wgs84._lon,
    seed,
  };
};

export const getDailyStartingLocation = (): StartingLocation => {
  // Convert UTC to UK time (GMT/BST) and use that date as seed
  const utcNow = new Date();
  const ukDate = new Date(utcNow.toLocaleString('en-GB', { timeZone: 'Europe/London' }));

  // Base seed from the UK date, plus any admin-applied offset
  const seed = getDailyBaseSeed(ukDate) + getSeedOffset();

  return getStartingLocationFromSeed(seed, ukDate);
};
