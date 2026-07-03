import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import './EndScreen.css';
import { type MapContainerProps } from 'react-leaflet';
import type { LatLng } from 'leaflet';
import { DataService } from '../DataService';
import { getDistanceKm, getDistanceMeters, getScoreForGuess } from '../ScoringService';

import MapView from '../Map/MapView';

function EndScreen({
  open,
  onClose,
  startingMarker,
  guesses,
}: {
  open: boolean;
  onClose?: () => void;
  startingMarker?: LatLng;
  guesses?: LatLng[];
}) {
  const [copied, setCopied] = useState(false);

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

  const getBestScore = (): number => {
    if (!guesses || guesses.length === 0) return 0;
    return guesses.reduce((best, g) => Math.max(best, getScoreForGuess(g, startingMarker) ?? 0), 0);
  };

  const getScoreEmoji = (score: number): string => {
    if (score >= 1000) return '✅';
    if (score >= 800) return '🟩';
    if (score >= 500) return '🟨';
    if (score >= 200) return '🟧';
    return '🟥';
  };

  const gameUrl = 'http://ordnance-surveydle.s3-website.eu-west-2.amazonaws.com/';

  const buildShareText = (): string => {
    const bestScore = getBestScore();
    const lines = [`[Ordnance Surveydle](${gameUrl}) — ${bestScore} pts`];

    if (guesses && guesses.length > 0) {
      guesses.forEach((g, i) => {
        const km = getDistanceKm(g, startingMarker);
        const score = getScoreForGuess(g, startingMarker);
        const distLabel = km === undefined ? '-' : `${km.toFixed(2)} km`;
        const scoreLabel = score !== undefined ? `${score} pts` : '';
        const emoji = getScoreEmoji(score ?? 0);
        lines.push(`${emoji} Guess ${i + 1}: ${distLabel} - ${scoreLabel}`);
      });
    } else {
      lines.push('No guesses were made.');
    }

    return lines.join('\n');
  };

  const handleShare = async () => {
    const text = buildShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.log('handleShare: clipboard write failed, falling back', e);
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        console.log('handleShare: fallback copy failed', fallbackError);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

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
      <Dialog className="end-screen" open={open} onClose={onClose}>
        <button className="end-screen-close" aria-label="close" onClick={onClose}>
          &times;
        </button>
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
            <h3>Game Summary</h3>
            {guessListElement}
            <button className="share-button" onClick={handleShare}>
              {copied ? 'Copied!' : 'Share Results'}
            </button>
          </aside>
        </div>
      </Dialog>
    </>
  );
}

export default EndScreen;
