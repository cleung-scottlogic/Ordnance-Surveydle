import type { LatLng } from 'leaflet';

interface ProgressProps {
  answerLocation: LatLng;
  guesses: LatLng[];
}

function Progress(props: ProgressProps) {
  const getDistanceToAnswer = (guess: LatLng): number | undefined => {
    return guess ? guess.distanceTo(props.answerLocation) / 1000 : void 0;
  };

  const getGuessHistory = () => {
    if (props.guesses.length == 0) return null;

    return (
      <ul>
        {props.guesses.map((g, i) => (
          <li className="guessEntry" key={i}>
            Last guess was {getDistanceToAnswer(g)?.toFixed(2)} Km away{' '}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      <span>Guesses remaining = {5 - (props.guesses.length ?? 0)}</span>
      <div>
        guess history:
        {getGuessHistory()}
      </div>
    </>
  );
}

export default Progress;
