import type { LatLng } from 'leaflet';
import type { JSX } from 'react/jsx-runtime';
import { getDistanceKm, getScoreForGuess } from '../ScoringService';

interface ProgressProps {
  answerLocation: LatLng;
  guesses: LatLng[];
}

function Progress(props: ProgressProps) {
  const getGuess = (i: number): JSX.Element | null => {
    if (i > props.guesses.length - 1) return null;

    const distance = getDistanceKm(props.guesses[i], props.answerLocation);
    const score = getScoreForGuess(props.guesses[i], props.answerLocation);

    return (
      <>
        <span className="guess">{distance?.toFixed(2)} km away</span>
        {score !== undefined && <span className="score">{score} pts</span>}
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
      placeholders = placeholders.concat(
        <div className="placeholder">
          <div className="rectangle">{getContent(i)}</div>
        </div>,
      );
    }

    return <>{placeholders}</>;
  };

  return <>{getGuessPlaceholder()}</>;
}

export default Progress;
