import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { useRef, useState } from 'react';
import './EndScreen.css';
import { type MapContainerProps } from 'react-leaflet';
import type { LatLng } from 'leaflet';
import { DataService, type DailyLocation } from '../DataService';
import {
  getDistanceKm,
  getDistanceMeters,
  getScoreForGuess,
} from '../ScoringService';

import MapView from '../Map/MapView';
import { Score } from '../Scores/Score';
import { AlreadySubmittedError, AwsService } from '../Aws/AwsService';
import Leaderboard from '../Leaderboard/Leaderboard';

function EndScreen({
  open,
  onClose,
  startingMarker,
  guesses,
  location,
}: {
  open: boolean;
  onClose?: () => void;
  startingMarker?: LatLng;
  guesses?: LatLng[];
  location?: DailyLocation;
}) {
  const [copied, setCopied] = useState(false);
  const summaryRef = useRef<HTMLElement>(null);
  const [playerName, setPlayerName] = useState<string | undefined>(void 0);
  const [saveCount, setSaveCount] = useState(0);
  const [saveError, setSaveError] = useState<string | undefined>(void 0);

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
      const distance =
        getDistanceMeters(guesses[i], startingMarker) ?? Infinity;
      if (distance < minDistance) {
        minDistance = distance;
        closest = guesses[i];
      }
    }

    return closest;
  };

  const closestGuess = getClosestGuess();

  const getScoreEmoji = (score: number): string => {
    if (score >= 1000) return '✅';
    if (score >= 800) return '🟩';
    if (score >= 500) return '🟨';
    if (score >= 200) return '🟧';
    return '🟥';
  };

  const gameUrl = 'https://osdle.kaiming.uk/';

  const buildShareText = (): string => {
    const lines = [`[Ordnance Surveydle](${gameUrl})`];

    if (guesses && guesses.length > 0) {
      guesses.forEach((g, i) => {
        const km = getDistanceKm(g, startingMarker);
        const score = getScoreForGuess(g, startingMarker);
        const distLabel = km === undefined ? '-' : `${km.toFixed(2)} km`;
        const emoji = getScoreEmoji(score ?? 0);
        lines.push(`${emoji} Guess ${i + 1}: ${distLabel}`);
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

    // Append inside the dialog so MUI's focus trap doesn't steal focus back.
    const container = summaryRef.current ?? document.body;
    container.appendChild(textarea);

    const selection = document.getSelection();
    const previousRange =
      selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

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

    container.removeChild(textarea);

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

  const handleSave = () => {
    if (playerName == void 0) return;
    if (guesses == void 0 || guesses.length === 0) return;

    const closestDistanceMeters = getDistanceMeters(closestGuess, startingMarker);
    if (closestDistanceMeters == void 0) return;

    const score = new Score(
      playerName,
      guesses,
      new Date(),
      Math.trunc(closestDistanceMeters * 100) / 100,
    );
    setSaveError(undefined);
    AwsService.saveResult(score)
      .then(() => setSaveCount((c) => c + 1))
      .catch((e) => {
        setSaveError(
          e instanceof AlreadySubmittedError
            ? e.message
            : 'Failed to save result. Please try again.',
        );
      });
  };

  return (
    <>
      <Dialog className='end-screen' open={open} onClose={onClose}>
        <button
          className='end-screen-close'
          aria-label='close'
          onClick={onClose}
        >
          &times;
        </button>
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

          <aside className='end-screen-summary' ref={summaryRef}>
            {location && (
              <div className='location-details'>
                <h3>{location.primaryPlaceName}</h3>
                <p className='location-field'>
                  <span className='location-label'>Type:</span> {location.type}
                </p>
                <p className='location-field'>
                  <span className='location-label'>County:</span>{' '}
                  {location.historicCounty}
                </p>
                {location.civilParish && (
                  <p className='location-field'>
                    <span className='location-label'>Civil Parish:</span>{' '}
                    {location.civilParish}
                  </p>
                )}
                {location.unitaryAuthorityArea && (
                  <p className='location-field'>
                    <span className='location-label'>
                      Unitary Authority Area:
                    </span>{' '}
                    {location.unitaryAuthorityArea}
                  </p>
                )}
                <p className='location-field'>
                  <span className='location-label'>Country:</span>{' '}
                  {location.country}
                </p>
                <p className='location-field'>
                  <span className='location-label'>Lat/Lng:</span>{' '}
                  {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                </p>
                {location.description && (
                  <p className='location-field'>
                    <span className='location-label'>Description:</span>{' '}
                    {location.description}
                  </p>
                )}
              </div>
            )}
            <div className='save-result'>
              <input
                id='player-name'
                className='player-name-input'
                placeholder='Enter Name'
                onInput={(e) =>
                  setPlayerName((e.target as HTMLInputElement).value)
                }
              />
              <button
                className='save-result-button'
                disabled={playerName == void 0}
                onClick={handleSave}
              >
                Submit Result
              </button>
              {saveError && <p className='save-error'>{saveError}</p>}
            </div>
            <button className='share-button' onClick={handleShare}>
              {copied ? 'Copied!' : 'Share Results'}
            </button>
            <Leaderboard refreshKey={saveCount} />
          </aside>
        </div>
      </Dialog>
    </>
  );
}

export default EndScreen;
