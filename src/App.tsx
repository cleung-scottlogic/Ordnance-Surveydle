import { useState } from "react";
import "./App.css";
import MapView from "./Map/MapView";
import type { MapContainerProps } from "react-leaflet";
import L, { LatLng, type LatLngExpression } from "leaflet";
import { DataService, fromGridRef, getStartinglocation } from "./DataService";
import { zoomLevels, type ZoomLevel } from "./Map/ZoomLevel";
import Progress from "./Progress/Progress";

function App() {
  const [guesses, setGuesses] = useState<LatLng[]>([]);
  const [currentGuessLocation, setCurrentGuessLocation] = useState<
    LatLng | undefined
  >();

  const [startingLocale] = useState(getStartinglocation());

  const maxZoomLevel = zoomLevels[0];

  const [minZoomLevel, setMinZoomLevel] = useState<ZoomLevel>(zoomLevels[0]);

  const origin = {
    lat: startingLocale.lat,
    lng: startingLocale.lng,
  };

  const boundFactor = minZoomLevel.boundsFactor * 2;

  const historicalMapContainerProps: MapContainerProps = {
    center: origin,
    minZoom: minZoomLevel.zoom,
    maxZoom: maxZoomLevel.zoom,
    zoom: minZoomLevel.zoom,
    dragging: true,
    doubleClickZoom: false,
    zoomControl: true,
    maxBounds: [
      [origin.lat + boundFactor, origin.lng + boundFactor],
      [origin.lat - boundFactor, origin.lng - boundFactor],
    ],
  };

  const osmOrigin = {
    lat: 54.970924,
    lng: -2.457155,
  };

  const osmMapContainerProps: MapContainerProps = {
    center: osmOrigin,
    zoomControl: true,
    zoom: 7,
  };

  return (
    <>
      <section className='header'>
        <Progress
          className='gameProgress'
          answerLocation={new LatLng(origin.lat, origin.lng)}
          guesses={guesses}
        />
      </section>
      <section id='center'>
        <MapView
          key={guesses.length}
          mapContainerProps={historicalMapContainerProps}
          tileLayer={`${DataService.historicalTileLayer}${DataService.historicalTileLayerKey}`}
          attribution={DataService.historicalAttribution}
          isMarkerEnabled={true}
          fixedMarker={new L.LatLng(origin.lat, origin.lng)}
        ></MapView>
        <MapView
          mapContainerProps={osmMapContainerProps}
          tileLayer={DataService.osmTileLayer}
          attribution={DataService.osmAttribution}
          isMarkerEnabled={true}
          setCurrentMarkerLocation={(location) =>
            setCurrentGuessLocation(location)
          }
        ></MapView>
        <button
          title='Submit'
          disabled={!currentGuessLocation}
          onClick={() => {
            if (currentGuessLocation) {
              setGuesses((guesses) => guesses.concat(currentGuessLocation));
              setMinZoomLevel(() => zoomLevels[guesses.length + 1]);
            }
          }}
        >
          {" "}
          Submit{" "}
        </button>
      </section>
    </>
  );
}

export default App;
