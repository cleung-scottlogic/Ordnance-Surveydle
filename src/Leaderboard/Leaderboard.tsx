import { useEffect, useState } from 'react';
import './Leaderboard.css';
import { AwsService, type LeaderboardEntry } from '../Aws/AwsService';
import { formatDistance } from '../ScoringService';

function Leaderboard({ refreshKey }: { refreshKey?: number }) {
  const [entries, setEntries] = useState<LeaderboardEntry[] | undefined>();
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(false);

    AwsService.getLeaderboard()
      .then((result) => {
        if (!cancelled) setEntries(result);
      })
      .catch((e) => {
        console.log('Leaderboard: failed to load', e);
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (error) return <p>Couldn't load today's leaderboard.</p>;
  if (!entries) return <p>Loading leaderboard...</p>;
  if (entries.length === 0) return <p>No scores submitted today yet.</p>;

  return (
    <div className='leaderboard'>
      <h3>Today's Leaderboard</h3>
      <ol className='leaderboard-list'>
        {entries.map((entry, i) => (
          <li key={i} className='leaderboard-item'>
            <span className='leaderboard-rank'>{i + 1}.</span>
            <span className='leaderboard-player'>{entry.player}</span>
            <span className='leaderboard-distance'>
              {formatDistance(entry.closestDistanceMeters)} in {entry.guessCount}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default Leaderboard;
