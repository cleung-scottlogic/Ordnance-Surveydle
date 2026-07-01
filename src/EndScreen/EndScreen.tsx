import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import "./EndScreen.css";
import { type MapContainerProps } from "react-leaflet";
import type { LatLng } from "leaflet";
import { DataService } from "../DataService";

import MapView from "../Map/MapView";

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

  const getDistanceToAnswer = (guess?: LatLng): number | undefined => {
    if (!startingMarker || !guess) return undefined;
    try {
      // distanceTo returns meters; convert to km to match Progress.tsx
      return guess.distanceTo(startingMarker) / 1000;
    } catch (e) {
      console.log("getDistanceToAnswer: failed to calculate distance", e);
      return undefined;
    }
  };

  const getClosestGuess = (): LatLng | undefined => {
    if (!startingMarker || !guesses || guesses.length === 0) return undefined;
    
    let closest = guesses[0];
    let minDistance = guesses[0].distanceTo(startingMarker);
    
    for (let i = 1; i < guesses.length; i++) {
      const distance = guesses[i].distanceTo(startingMarker);
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
      const km = getDistanceToAnswer(g);
      const distLabel = km === undefined ? "-" : `${km.toFixed(2)} km away`;
      const isClosest = closestGuess && g.equals(closestGuess) ? " (Closest)" : "";
      return (
        <div key={i} className='guess-item'>
          <strong>Guess {i + 1}:</strong> {distLabel}
          {isClosest}
        </div>
      );
    });

    return <div className='guess-list'>{items}</div>;
  };

  const guessListElement = renderGuessList();

  return (
    <>
      <Dialog className='end-screen' open={open}>
        <DialogTitle className='title'>Game Over</DialogTitle>
        <div className='end-screen-content'>
          <div className='end-screen-map'>
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

          <aside className='end-screen-summary'>
            <h3>Guesses Summary</h3>
            {guessListElement}
          </aside>
        </div>
      </Dialog>
    </>
  );
}

export default EndScreen;
