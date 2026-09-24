import { useEffect, useState } from 'react';
import './AdminPage.css';
import { fetchDailyLocation, getSeedOffset, triggerSeedReroll } from '../DataService';
import type { DailyLocation } from '../DataService';

function AdminPage() {
  const [location, setLocation] = useState<DailyLocation | undefined>();
  const [offsetInput, setOffsetInput] = useState<string>(String(getSeedOffset()));

  useEffect(() => {
    void fetchDailyLocation().then(setLocation);
  }, []);

  const handleApplyOffset = () => {
    const offset = parseInt(offsetInput, 10);
    if (!Number.isFinite(offset)) {
      return;
    }

    void triggerSeedReroll(offset)
      .then(() => fetchDailyLocation())
      .then(setLocation);
  };

  if (!location) {
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
          <span className="admin-label">Place</span>
          <span className="admin-value">{location.primaryPlaceName}</span>
        </div>
        <div className="admin-row">
          <span className="admin-label">Latitude</span>
          <span className="admin-value">{location.lat}</span>
        </div>
        <div className="admin-row">
          <span className="admin-label">Longitude</span>
          <span className="admin-value">{location.lng}</span>
        </div>
        <div className="admin-row">
          <span className="admin-label">Date</span>
          <span className="admin-value">{dateString}</span>
        </div>
      </div>

      <div className="admin-offset">
        <label className="admin-label" htmlFor="offset-input">
          Offset
        </label>
        <input
          id="offset-input"
          className="admin-input"
          type="number"
          value={offsetInput}
          onChange={(e) => setOffsetInput(e.target.value)}
        />
        <button className="admin-button" onClick={handleApplyOffset}>
          Apply Offset
        </button>
      </div>
    </section>
  );
}

export default AdminPage;
