import type { LatLng } from 'leaflet';
import type { JSX } from 'react/jsx-runtime';

interface ProgressProps {
  answerLocation: LatLng;
  guesses: LatLng[];
}

function Progress(props: ProgressProps) {
  const getDistanceToAnswer = (guess: LatLng): number | undefined => {
    return guess ? guess.distanceTo(props.answerLocation) / 1000 : void 0;
  };

  const getGuess = (i: number): JSX.Element | null => {
    if (i > props.guesses.length - 1) return null;

    return (
      <>
        <span className="guess">{getDistanceToAnswer(props.guesses[i])?.toFixed(2)} km away</span>
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
