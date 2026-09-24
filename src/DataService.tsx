import { AwsService } from './Aws/AwsService';

interface DataService {
  osmTileLayer: string;
  osmAttribution: string;
  historicalTileLayer: string;
  historicalTileLayerKey: string;
  historicalAttribution: string;
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

// Fetches the raw S3 record via AwsService, then maps it to the app's DailyLocation shape.
export const fetchDailyLocation = async (): Promise<DailyLocation> => {
  const data = await AwsService.fetchDailyLocation();
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
