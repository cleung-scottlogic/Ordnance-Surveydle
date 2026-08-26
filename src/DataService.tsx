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

export interface DailyLocation {
  id: string;
  gbpnUrl: string;
  primaryPlaceName: string;
  gridReference: string;
  lat: number;
  lng: number;
  type: string;
  historicCounty: string;
  division: string | null;
  island: string | null;
  townland: string | null;
  civilParish: string | null;
  administrativeCounty: string | null;
  district: string | null;
  unitaryAuthorityArea: string | null;
  policeArea: string | null;
  country: string;
  description: string | null;
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

const setSeedOffset = (offset: number): void => {
  try {
    localStorage.setItem(SEED_OFFSET_KEY, String(offset));
  } catch (e) {
    console.log('setSeedOffset: failed to persist seed offset', e);
  }
};

// Lambda Function URL that regenerates the daily seed for a given reroll count.
const REROLL_LAMBDA_URL = import.meta.env.VITE_REROLL_LAMBDA_URL;

// Persist the chosen reroll offset and ask the Lambda to regenerate the seed.
// The new seed is written to S3 by the Lambda, so callers should re-fetch the
// starting location afterwards.
export const triggerSeedReroll = async (reroll: number): Promise<void> => {
  setSeedOffset(reroll);
  const response = await fetch(REROLL_LAMBDA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reroll }),
  });
  if (!response.ok) {
    throw new Error(`seed reroll failed: ${response.status}`);
  }
};

// Public S3 bucket holding the current day's seed and location objects.
const DAILY_BUCKET_URL =
  'https://ckl-mapgame-daily-seeds-696537702940-eu-west-2-an.s3.eu-west-2.amazonaws.com';

// Public S3 object holding the current day's seed as a raw JSON number, e.g. 2124808443.
const DAILY_SEED_URL = `${DAILY_BUCKET_URL}/seed`;

// Public S3 object holding the current day's location as a JSON gazetteer record.
const DAILY_LOCATION_URL = `${DAILY_BUCKET_URL}/location`;

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

// Raw gazetteer record shape as stored in S3, before mapping to DailyLocation.
interface RawDailyLocation {
  ID: string;
  'GBPN URL': string;
  'Primary Place Name': string;
  'Grid Reference': string;
  Latitude: string;
  Longitude: string;
  Type: string;
  'Historic County': string;
  Division: string | null;
  Island: string | null;
  Townland: string | null;
  'Civil Parish': string | null;
  'Administrative County': string | null;
  District: string | null;
  'Unitary Authority Area': string | null;
  'Police Area': string | null;
  Country: string;
  Description: string | null;
}

// https://gazetteer.org.uk/contents
export const fetchDailyLocation = async (): Promise<DailyLocation> => {
  const response = await fetch(DAILY_LOCATION_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`location request failed: ${response.status}`);
  }
  const data = (await response.json()) as RawDailyLocation;
  if (!data || typeof data.ID !== 'string') {
    throw new Error('location missing or malformed');
  }
  return {
    id: data.ID,
    gbpnUrl: data['GBPN URL'],
    primaryPlaceName: data['Primary Place Name'],
    gridReference: data['Grid Reference'],
    lat: Number(data.Latitude),
    lng: Number(data.Longitude),
    type: data.Type,
    historicCounty: data['Historic County'],
    division: data.Division,
    island: data.Island,
    townland: data.Townland,
    civilParish: data['Civil Parish'],
    administrativeCounty: data['Administrative County'],
    district: data.District,
    unitaryAuthorityArea: data['Unitary Authority Area'],
    policeArea: data['Police Area'],
    country: data.Country,
    description: data.Description,
  };
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
