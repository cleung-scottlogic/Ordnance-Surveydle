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

  const origin = {
    lat: startingLocale.lat,
    lng: startingLocale.lng,
  };

  const boundFactor = zoomLevels[guesses.length].boundsFactor * 2;

  const historicalMapContainerProps: MapContainerProps = {
    center: origin,
    minZoom: zoomLevels[guesses.length].zoom,
    maxZoom: zoomLevels[0].zoom,
    zoom: zoomLevels[guesses.length].zoom,
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

  const isSubmitDisabled = (): boolean => {
    return !currentGuessLocation || guesses.length === 5;
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
          isCustomMarkerEnabled={false}
          fixedMarker={new L.LatLng(origin.lat, origin.lng)}
        ></MapView>
        <MapView
          mapContainerProps={osmMapContainerProps}
          tileLayer={DataService.osmTileLayer}
          attribution={DataService.osmAttribution}
          isCustomMarkerEnabled={true}
          existingMarkers={guesses}
          setCurrentMarkerLocation={(location) =>
            setCurrentGuessLocation(location)
          }
        ></MapView>
        <button
          title='Submit'
          disabled={isSubmitDisabled()}
          onClick={() => {
            if (currentGuessLocation) {
              setGuesses((guesses) => guesses.concat(currentGuessLocation));
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
