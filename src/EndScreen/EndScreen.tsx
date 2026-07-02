import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import './EndScreen.css';
import { type MapContainerProps } from 'react-leaflet';
import type { LatLng } from 'leaflet';
import { DataService } from '../DataService';
import { getDistanceKm, getDistanceMeters, getScoreForGuess } from '../ScoringService';

import MapView from '../Map/MapView';

function EndScreen({
  open,
  startingMarker,
  guesses,
}: {
  open: boolean;
  startingMarker?: LatLng;
  guesses?: LatLng[];
}) {
  const osmMapContainerProps: MapContainerProps = {
    center: startingMarker,
    zoomControl: true,
    zoom: 7,
  };

  const getClosestGuess = (): LatLng | undefined => {
    if (!startingMarker || !guesses || guesses.length === 0) return undefined;

    let closest = guesses[0];
    let minDistance = getDistanceMeters(guesses[0], startingMarker) ?? Infinity;

    for (let i = 1; i < guesses.length; i++) {
      const distance = getDistanceMeters(guesses[i], startingMarker) ?? Infinity;
      if (distance < minDistance) {
        minDistance = distance;
        closest = guesses[i];
      }
    }

    return closest;
  };

  const closestGuess = getClosestGuess();

  const renderGuessList = () => {
    if (!guesses || guesses.length === 0) return <p>No guesses were made.</p>;

    const items = guesses.map((g, i) => {
      const km = getDistanceKm(g, startingMarker);
      const score = getScoreForGuess(g, startingMarker);
      const distLabel = km === undefined ? '-' : `${km.toFixed(2)} km away`;
      const scoreLabel = score !== undefined ? ` - ${score} pts` : '';
      const isClosest = closestGuess && g.equals(closestGuess);
      return (
        <div key={i} className={`guess-item ${isClosest ? 'closest' : ''}`}>
          <strong>Guess {i + 1}:</strong> {distLabel}
          {scoreLabel}
        </div>
      );
    });

    return <div className="guess-list">{items}</div>;
  };

  const guessListElement = renderGuessList();

  return (
    <>
      <Dialog className="end-screen" open={open}>
        <DialogTitle className="title">Game Over</DialogTitle>
        <div className="end-screen-content">
          <div className="end-screen-map">
            <MapView
              mapContainerProps={osmMapContainerProps}
              tileLayer={DataService.osmTileLayer}
              attribution={DataService.osmAttribution}
              fixedMarker={startingMarker}
              zoomToFixedMarker={14}
              autoFlyToFixedMarker={true}
              existingMarkers={guesses}
              closestMarker={closestGuess}
            />
          </div>

          <aside className="end-screen-summary">
            <h3>Guesses Summary</h3>
            {guessListElement}
          </aside>
        </div>
      </Dialog>
    </>
  );
}

export default EndScreen;
