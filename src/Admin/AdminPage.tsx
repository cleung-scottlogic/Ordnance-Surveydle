import { useEffect, useState } from 'react';
import './AdminPage.css';
import { getDailyStartingLocation, triggerSeedReroll } from '../DataService';
import type { StartingLocation } from '../DataService';

function AdminPage() {
  const [startingLocation, setStartingLocation] = useState<StartingLocation | undefined>();

  useEffect(() => {
    void getDailyStartingLocation().then(setStartingLocation);
  }, []);

  const handleIncrementSeed = () => {
    void triggerSeedReroll()
      .then(() => getDailyStartingLocation())
      .then(setStartingLocation);
  };

  if (!startingLocation) {
    return null;
  }

  const dateString = new Date().toLocaleString('en-GB', {
    timeZone: 'Europe/London',
  });

  return (
    <section id="admin">
      <div className="header">
        <h1>Admin</h1>
        <h2>Daily Starting Location</h2>
      </div>

      <div className="admin-details">
        <div className="admin-row">
          <span className="admin-label">Latitude</span>
          <span className="admin-value">{startingLocation.lat}</span>
        </div>
        <div className="admin-row">
          <span className="admin-label">Longitude</span>
          <span className="admin-value">{startingLocation.lng}</span>
        </div>
        <div className="admin-row">
          <span className="admin-label">Date</span>
          <span className="admin-value">{dateString}</span>
        </div>
        <div className="admin-row">
          <span className="admin-label">Seed</span>
          <span className="admin-value">{startingLocation.seed}</span>
        </div>
      </div>

      <button className="admin-button" onClick={handleIncrementSeed}>
        Increase Seed
      </button>
    </section>
  );
}

export default AdminPage;
