import { useState } from 'react';
import './AdminPage.css';
import { getDailyStartingLocation } from '../DataService';

function AdminPage() {
  const [startingLocation] = useState(getDailyStartingLocation());

  const dateString = startingLocation.date.toLocaleString('en-GB', {
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
    </section>
  );
}

export default AdminPage;
