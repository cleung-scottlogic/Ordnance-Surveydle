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

  const copyWithFallback = (text: string): boolean => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // Keep it out of view but still selectable/focusable across browsers.
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '1px';
    textarea.style.height = '1px';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);

    const selection = document.getSelection();
    const previousRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    textarea.focus();
    textarea.select();
    // iOS Safari requires an explicit selection range.
    textarea.setSelectionRange(0, text.length);

    let succeeded = false;
    try {
      succeeded = document.execCommand('copy');
    } catch (e) {
      console.log('copyWithFallback: execCommand copy failed', e);
      succeeded = false;
    }

    document.body.removeChild(textarea);

    // Restore any prior user selection.
    if (previousRange && selection) {
      selection.removeAllRanges();
      selection.addRange(previousRange);
    }

    return succeeded;
  };

  const handleShare = async () => {
    const text = buildShareText();

    // Prefer the async Clipboard API when available (secure contexts only).
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      } catch (e) {
        console.log('handleShare: clipboard API failed, falling back', e);
      }
    }

    // Fallback for insecure contexts (e.g. HTTP) or unsupported browsers.
    const succeeded = copyWithFallback(text);
    if (succeeded) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      console.log('handleShare: all copy strategies failed');
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
