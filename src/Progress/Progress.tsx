import type { LatLng } from 'leaflet';
import type { JSX } from 'react/jsx-runtime';
import { getDistanceKm } from '../ScoringService';

interface ProgressProps {
  answerLocation: LatLng;
  guesses: LatLng[];
  onGuessClick?: (guess: LatLng) => void;
}

function Progress(props: ProgressProps) {
  const distances = props.guesses.map((guess) => getDistanceKm(guess, props.answerLocation));
  const closestDistance = distances.reduce<number | undefined>((best, distance) => {
    if (distance === undefined) return best;
    return best === undefined ? distance : Math.min(best, distance);
  }, undefined);

  const getGuess = (i: number): JSX.Element | null => {
    if (i > props.guesses.length - 1) return null;

    const distance = distances[i];

    return (
      <>
        <span className="guess">{distance?.toFixed(2)} km away</span>
      </>
    );
  };

  const getContent = (i: number): JSX.Element | null => {
    if (i > props.guesses.length - 1) {
      return <span className="magnifyingGlass">&#128270;</span>;
    } else {
      return <>{getGuess(i)}</>;
    }
  };

  const getGuessPlaceholder = () => {
    let placeholders: JSX.Element[] = [];

    for (let i = 0; i < 5; i++) {
      const isClosest = closestDistance !== undefined && distances[i] === closestDistance;
      const guess = i <= props.guesses.length - 1 ? props.guesses[i] : undefined;
      placeholders = placeholders.concat(
        <div className="placeholder">
          <div
            className={`rectangle${isClosest ? ' closest' : ''}${guess ? ' clickable' : ''}`}
            role={guess ? 'button' : undefined}
            tabIndex={guess ? 0 : undefined}
            onClick={guess ? () => props.onGuessClick?.(guess) : undefined}
            onKeyDown={
              guess
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      props.onGuessClick?.(guess);
                    }
                  }
                : undefined
            }
          >
            {getContent(i)}
          </div>
        </div>,
      );
    }

    return <>{placeholders}</>;
  };

  return <>{getGuessPlaceholder()}</>;
}

export default Progress;
