import { useEffect, useState } from 'react';
import './App.css';
import MapView from './Map/MapView';
import type { MapContainerProps } from 'react-leaflet';
import L, { LatLng } from 'leaflet';
import { DataService, fetchDailyLocation } from './DataService';
import type { DailyLocation } from './DataService';
import Progress from './Progress/Progress';
import { ZOOM_LEVELS } from './Map/ZoomLevel';
import EndScreen from './EndScreen/EndScreen';
import HowToPlay from './HowToPlay/HowToPlay';
import { getScoreForGuess } from './ScoringService';

function App() {
  const [guesses, setGuesses] = useState<LatLng[]>([]);
  const [currentGuessLocation, setCurrentGuessLocation] = useState<
    LatLng | undefined
  >();
  const [endScreenOpen, setEndScreenOpen] = useState(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);

  const [startingLocale, setStartingLocale] = useState<
    DailyLocation | undefined
  >();

  useEffect(() => {
    void fetchDailyLocation().then(setStartingLocale);
  }, []);

  // Propagate seed changes made on the admin page: reset the game to the new location.
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== 'mapgame:seedOffset') return;

      void fetchDailyLocation().then((location) => {
        setStartingLocale(location);
        setGuesses([]);
        setCurrentGuessLocation(undefined);
        setEndScreenOpen(false);
      });
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!startingLocale) {
    return null;
  }

  const origin = {
    lat: startingLocale.lat,
    lng: startingLocale.lng,
  };

  const answerLocation = new LatLng(origin.lat, origin.lng);

  const hasPerfectGuess = guesses.some(
    (guess) => getScoreForGuess(guess, answerLocation) === 1000,
  );

  const isGameOver = guesses.length >= 5 || hasPerfectGuess;

  // On a win, show the map as if 5 guesses had been made instead of locking to zoom level 1.
  const zoomLevelIndex = hasPerfectGuess
    ? ZOOM_LEVELS.length - 1
    : guesses.length;

  const boundFactor = ZOOM_LEVELS[zoomLevelIndex].boundsFactor * 4;

  const historicalMaxZoom = ZOOM_LEVELS[0].zoom;
  const historicalZoom = ZOOM_LEVELS[zoomLevelIndex].zoom;

  const historicalMapContainerProps: MapContainerProps = {
    center: origin,
    minZoom: historicalZoom,
    maxZoom: historicalMaxZoom,
    zoom: historicalZoom,
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

    const isPerfect =
      getScoreForGuess(currentGuessLocation, answerLocation) === 1000;
    if (updatedGuesses.length >= 5 || isPerfect) {
      setEndScreenOpen(true);
    }
  };

  return (
    <>
      <HowToPlay open={howToPlayOpen} onClose={() => setHowToPlayOpen(false)} />
      <section id='center'>
        <section id='progress'>
          <button
            className='how-to-play-button'
            onClick={() => setHowToPlayOpen(true)}
          >
            How to Play
          </button>
          <Progress answerLocation={answerLocation} guesses={guesses} />
        </section>
        <section id='maps'>
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
            className='submit-button'
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
        <EndScreen
          open={endScreenOpen}
          onClose={() => setEndScreenOpen(false)}
          startingMarker={new L.LatLng(origin.lat, origin.lng)}
          guesses={guesses}
          location={startingLocale}
        />
      </section>
    </>
  );
}

export default App;
