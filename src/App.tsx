import { useState } from 'react';
import './App.css';
import MapView from './Map/MapView';
import type { MapContainerProps } from 'react-leaflet';
import L, { LatLng } from 'leaflet';
import { DataService, getDailyStartingLocation } from './DataService';
import Progress from './Progress/Progress';
import { ZOOM_LEVELS } from './Map/ZoomLevel';
import EndScreen from './EndScreen/EndScreen';
import { getScoreForGuess } from './ScoringService';

function App() {
  const [guesses, setGuesses] = useState<LatLng[]>([]);
  const [currentGuessLocation, setCurrentGuessLocation] = useState<LatLng | undefined>();
  const [endScreenOpen, setEndScreenOpen] = useState(false);

  const [startingLocale] = useState(getDailyStartingLocation());

  const origin = {
    lat: startingLocale.lat,
    lng: startingLocale.lng,
  };

  const answerLocation = new LatLng(origin.lat, origin.lng);

  const hasPerfectGuess = guesses.some((guess) => getScoreForGuess(guess, answerLocation) === 1000);

  const isGameOver = guesses.length >= 5 || hasPerfectGuess;

  const boundFactor = ZOOM_LEVELS[guesses.length].boundsFactor * 4;

  const historicalMapContainerProps: MapContainerProps = {
    center: origin,
    minZoom: ZOOM_LEVELS[guesses.length].zoom,
    maxZoom: ZOOM_LEVELS[0].zoom,
    zoom: ZOOM_LEVELS[guesses.length].zoom,
    dragging: true,
    doubleClickZoom: false,
    zoomControl: true,
    maxBounds: [
      [origin.lat + boundFactor, origin.lng + boundFactor],
      [origin.lat - boundFactor, origin.lng - boundFactor],
    ],
    maxBoundsViscosity: 1,
    bounceAtZoomLimits: false,
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
    return !currentGuessLocation || isGameOver;
  };

  const handleSubmit = () => {
    if (!currentGuessLocation) return;

    const updatedGuesses = guesses.concat(currentGuessLocation);
    setGuesses(updatedGuesses);

    const isPerfect = getScoreForGuess(currentGuessLocation, answerLocation) === 1000;
    if (updatedGuesses.length >= 5 || isPerfect) {
      setEndScreenOpen(true);
    }
  };

  return (
    <>
      <section id="center">
        <MapView
          key={guesses.length}
          mapContainerProps={historicalMapContainerProps}
          tileLayer={`${DataService.historicalTileLayer}${DataService.historicalTileLayerKey}`}
          attribution={DataService.historicalAttribution}
          isCustomMarkerEnabled={false}
          fixedMarker={new L.LatLng(origin.lat, origin.lng)}
        ></MapView>
        <section id="progress">
          <Progress answerLocation={answerLocation} guesses={guesses} />
          <button
            title={isGameOver ? 'Results' : 'Submit'}
            disabled={isGameOver ? false : isSubmitDisabled()}
            onClick={() => {
              if (isGameOver) {
                setEndScreenOpen(true);
              } else {
                handleSubmit();
              }
            }}
          >
            {isGameOver ? 'Results' : 'Submit'}
          </button>
        </section>
        <MapView
          mapContainerProps={osmMapContainerProps}
          tileLayer={DataService.osmTileLayer}
          attribution={DataService.osmAttribution}
          isCustomMarkerEnabled={true}
          existingMarkers={guesses}
          setCurrentMarkerLocation={(location) => setCurrentGuessLocation(location)}
        ></MapView>
        <EndScreen
          open={endScreenOpen}
          onClose={() => setEndScreenOpen(false)}
          startingMarker={new L.LatLng(origin.lat, origin.lng)}
          guesses={guesses}
        />
      </section>
    </>
  );
}

export default App;
