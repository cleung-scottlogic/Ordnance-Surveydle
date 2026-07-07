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

export interface StartingLocation {
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

const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const SEED_OFFSET_KEY = 'mapgame:seedOffset';

const getSeedOffset = (): number => {
  try {
    const stored = localStorage.getItem(SEED_OFFSET_KEY);
    const parsed = stored === null ? 0 : parseInt(stored, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch (e) {
    console.log('getSeedOffset: failed to read seed offset', e);
    return 0;
  }
};

const setSeedOffset = (offset: number): void => {
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

// Public S3 object holding the current day's seed, e.g. { "seed": 123456 }.
const DAILY_SEED_URL =
  'https://ckl-mapgame-daily-seeds-696537702940-eu-west-2-an.s3.eu-west-2.amazonaws.com/seed';

const fetchDailySeed = async (): Promise<number> => {
  const response = await fetch(DAILY_SEED_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`seed request failed: ${response.status}`);
  }
  const data = await response.json();
  const seed = Number(data);
  if (!Number.isFinite(seed)) {
    throw new Error('seed missing or not a number');
  }
  return seed >>> 0;
};

// Generate a starting location deterministically from a seed value.
const getStartingLocationFromSeed = (seed: number): StartingLocation => {
  // prettier-ignore
  const osGridSquares = [
    "HU","NC","NG","NH",
    "NJ","NO","NN","NM","NR","NS","NT","NZ",
    "NY","NX","NY","NZ","SE","SD","SH",
    "SJ","SK","TF","SN","SO","SP","TL",
    "TM","TQ","SU","ST","SS","SX"
  ];

  // grid references that contain too much sea
  // ,"HY",,"ND","NB",,"NF","TA","TG","TR","SW",    "NU"

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
    gridReference,
    easting,
    northing,
    lat: wgs84._lat,
    lng: wgs84._lon,
    seed,
  };
};

export const getDailyStartingLocation = async (): Promise<StartingLocation> => {
  const seed = await fetchDailySeed();

  return getStartingLocationFromSeed(seed);
};
