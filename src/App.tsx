import { useEffect, useRef, useState } from 'react';
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
import { getDistanceKm, getScoreForGuess } from './ScoringService';

function App() {
  const [guesses, setGuesses] = useState<LatLng[]>([]);
  const [currentGuessLocation, setCurrentGuessLocation] = useState<LatLng | undefined>();
  const [endScreenOpen, setEndScreenOpen] = useState(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [progressCollapsed, setProgressCollapsed] = useState(false);
  // fraction (0-1) of the vertical space given to the top map
  const [topMapFlex, setTopMapFlex] = useState(0.5);
  const mapsRef = useRef<HTMLElement>(null);
  const isDraggingSplit = useRef(false);
  // last guess distance, briefly shown as a large fading overlay
  const [scorePop, setScorePop] = useState<{ distance: number; id: number } | null>(null);

  const [startingLocale, setStartingLocale] = useState<DailyLocation | undefined>();

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

  // Drag the divider between the two maps to resize them.
  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      if (!isDraggingSplit.current || !mapsRef.current) return;

      const rect = mapsRef.current.getBoundingClientRect();
      const ratio = (event.clientY - rect.top) / rect.height;
      setTopMapFlex(Math.min(0.85, Math.max(0.15, ratio)));
    };

    const stopDragging = () => {
      if (!isDraggingSplit.current) return;
      isDraggingSplit.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', stopDragging);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', stopDragging);
    };
  }, []);

  if (!startingLocale) {
    return null;
  }

  const origin = {
    lat: startingLocale.lat,
    lng: startingLocale.lng,
  };

  const answerLocation = new LatLng(origin.lat, origin.lng);

  const hasPerfectGuess = guesses.some((guess) => getScoreForGuess(guess, answerLocation) === 1000);

  const isGameOver = guesses.length >= 5 || hasPerfectGuess;

  // On a win, show the map as if 5 guesses had been made instead of locking to zoom level 1.
  const zoomLevelIndex = hasPerfectGuess ? ZOOM_LEVELS.length - 1 : guesses.length;

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
    zoomControl: false,
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
    zoomControl: false,
    zoom: 7,
  };

  const isSubmitDisabled = (): boolean => {
    return !currentGuessLocation || isGameOver;
  };

  const handleSubmit = () => {
    if (!currentGuessLocation) return;

    const score = getScoreForGuess(currentGuessLocation, answerLocation);
    const distance = getDistanceKm(currentGuessLocation, answerLocation);
    if (distance !== undefined) {
      setScorePop({ distance, id: Date.now() });
    }

    const updatedGuesses = guesses.concat(currentGuessLocation);
    setGuesses(updatedGuesses);

    const isPerfect = score === 1000;
    if (updatedGuesses.length >= 5 || isPerfect) {
      setEndScreenOpen(true);
    }
  };

  const handleSplitterMouseDown = (event: React.MouseEvent) => {
    // ignore drags that start on the submit button sitting on the divider
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    isDraggingSplit.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <>
      <HowToPlay open={howToPlayOpen} onClose={() => setHowToPlayOpen(false)} />
      <section id="center">
        <section id="progress" className={progressCollapsed ? 'collapsed' : ''}>
          <button
            className="progress-toggle"
            aria-label={progressCollapsed ? 'Expand panel' : 'Minimise panel'}
            title={progressCollapsed ? 'Expand panel' : 'Minimise panel'}
            onClick={() => setProgressCollapsed((collapsed) => !collapsed)}
          >
            {progressCollapsed ? '\u203A' : '\u2039'}
          </button>
          {!progressCollapsed && (
            <>
              <button className="how-to-play-button" onClick={() => setHowToPlayOpen(true)}>
                How to Play
              </button>
              <Progress answerLocation={answerLocation} guesses={guesses} />
            </>
          )}
        </section>
        <section id="maps" ref={mapsRef}>
          {scorePop && (
            <div key={scorePop.id} className="score-pop" onAnimationEnd={() => setScorePop(null)}>
              <span className="score-pop-distance">{scorePop.distance.toFixed(2)} km</span>
              <span className="score-pop-away">away</span>
            </div>
          )}
          <div className="map-pane" style={{ flexGrow: topMapFlex }}>
            <MapView
              key={guesses.length}
              mapContainerProps={historicalMapContainerProps}
              tileLayer={`${DataService.historicalTileLayer}${DataService.historicalTileLayerKey}`}
              attribution={DataService.historicalAttribution}
              isCustomMarkerEnabled={false}
              zoomControlPosition="bottomright"
              fixedMarker={new L.LatLng(origin.lat, origin.lng)}
            ></MapView>
          </div>
          <div
            className="map-splitter"
            role="separator"
            aria-orientation="horizontal"
            onMouseDown={handleSplitterMouseDown}
          ></div>
          <div className="map-pane" style={{ flexGrow: 1 - topMapFlex }}>
            <MapView
              mapContainerProps={osmMapContainerProps}
              tileLayer={DataService.osmTileLayer}
              attribution={DataService.osmAttribution}
              isCustomMarkerEnabled={true}
              zoomControlPosition="bottomright"
              existingMarkers={guesses}
              setCurrentMarkerLocation={(location) => setCurrentGuessLocation(location)}
            ></MapView>
            <button
              className="submit-button"
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
          </div>
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
