// import OsGridRef from "https://cdn.jsdelivr.net/npm/geodesy@2/osgridref.js?url";
import OsGridRef from "geodesy/osgridref";

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
}

export const DataService: DataService = {
  osmTileLayer: import.meta.env.VITE_OSM_TILELAYER,
  osmAttribution: `&copy; <a href="${import.meta.env.VITE_OSM_ATTRIBUTION}">OpenStreetMap</a> contributors`,
  historicalTileLayer: import.meta.env.VITE_HISTORICAL_TILELAYER,
  // TODO: DELETE AND CREATE NEW KEY FOR VAULT
  historicalTileLayerKey: "fIGLURh5nxHfE0ydIxke",
  historicalAttribution: `<a href="${import.meta.env.VITE_HISTORICAL_ATTRIBUTION}">National Library of Scotland</a>`,
};

export const getStartinglocation = (): StartingLocation => {
  // prettier-ignore
  const osGridSquares = [
    "HU","HY","ND","NC","NB","NF","NG","NH",
    "NJ","NO","NN","NM","NR","NS","NT","NZ",
    "NY","NX","NY","NZ","TA","SE","SD","SH",
    "SJ","SK","TF","TG","SN","SO","SP","TL",
    "TM","TR","TQ","SU","ST","SS","SW","SX",
    "NU"
  ]

  const getRandomThreeDigitNumber = (): string => {
    const value = Math.floor(Math.random() * 999);

    return value.toString().padStart(3, "0");
  };

  const gridReference: string =
    osGridSquares[Math.floor(Math.random() * osGridSquares.length)];
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

// from os-transform.js
// TODO: Is this fine to lift?
/**
 * Return easting + northing from an input grid reference.
 * @param {string} gridref - The grid reference to be converted.
 */
export const fromGridRef = (gridref: string) => {
  gridref = String(gridref).trim();

  const gridLetters = "VWXYZQRSTULMNOPFGHJKABCDE";

  const ref = gridref.toUpperCase().replace(/ /g, "");

  const majorEasting = (gridLetters.indexOf(ref[0]) % 5) * 500000 - 1000000;
  const majorNorthing =
    Math.floor(gridLetters.indexOf(ref[0]) / 5) * 500000 - 500000;

  const minorEasting = (gridLetters.indexOf(ref[1]) % 5) * 100000;
  const minorNorthing = Math.floor(gridLetters.indexOf(ref[1]) / 5) * 100000;

  const i = (ref.length - 2) / 2;
  const m = Math.pow(10, 5 - i);

  const e = majorEasting + minorEasting + Number(ref.substring(2, i + 2)) * m;
  const n = majorNorthing + minorNorthing + Number(ref.substring(i + 2)) * m;

  return { ea: e, no: n };
};
