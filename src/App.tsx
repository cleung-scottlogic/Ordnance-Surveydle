import { useState } from "react";
import "./App.css";
import MapView from "./Map/MapView";
import type { MapContainerProps } from "react-leaflet";
import { zoomLevels } from "./Map/zoomLevel";

function App() {
  const [guesses, setGuesses] = useState(0);

  console.log(import.meta.env.VITE_OSM_TILELAYER);
  const osmTileLayer = import.meta.env.VITE_OSM_TILELAYER;
  const osmAttribution = `&copy; <a href="${import.meta.env.VITE_OSM_ATTRIBUTION}">OpenStreetMap</a> contributors`;
  const historicalTileLayer = import.meta.env.VITE_HISTORICAL_TILELAYER;
  const key = "fIGLURh5nxHfE0ydIxke";
  const historicalAttribution = `<a href="${import.meta.env.VITE_HISTORICAL_ATTRIBUTION}">National Library of Scotland</a>`;

  const maxZoom = zoomLevels.one.zoom;
  let minZoom = zoomLevels.two.zoom;
  const origin = {
    lat: 51.505,
    lng: -0.09,
  };
  const boundFactor = zoomLevels.two.boundsFactor;

  const historicalMapContainerProps: MapContainerProps = {
    center: origin,
    minZoom,
    maxZoom,
    zoom: maxZoom,
    dragging: true,
    doubleClickZoom: false,
    zoomControl: true,
    maxBounds: [
      [origin.lat + boundFactor, origin.lng + boundFactor],
      [origin.lat - boundFactor, origin.lng - boundFactor],
    ],
  };

  const osmMapContainerProps: MapContainerProps = {
    center: origin,
    zoomControl: true,
    zoom: 13,
  };

  return (
    <>
      <section id="center">
        <MapView
          tileLayer={`${historicalTileLayer}${key}`}
          attribution={historicalAttribution}
          mapContainerProps={historicalMapContainerProps}
        ></MapView>
        <MapView
          mapContainerProps={osmMapContainerProps}
          tileLayer={osmTileLayer}
          attribution={osmAttribution}
          isMarkerEnabled={true}
        ></MapView>
      </section>
    </>
  );
}

export default App;
