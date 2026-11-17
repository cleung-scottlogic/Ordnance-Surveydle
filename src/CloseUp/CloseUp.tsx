import { useState } from 'react';
import { CircleMarker, MapContainer, TileLayer } from 'react-leaflet';
import type { LatLngLiteral } from 'leaflet';
import './CloseUp.css';

const CLOSE_UP_ZOOM = 18;
// The historical tileset only goes up to z17, so z18 is rendered by upscaling those tiles.
const MAX_NATIVE_ZOOM = 17;

interface CloseUpProps {
  center: LatLngLiteral;
  tileLayer: string;
}

// Toggleable, fixed (non-pannable, non-zoomable) close-up of the answer location.
function CloseUp({ center, tileLayer }: CloseUpProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className='close-up'>
      <button
        type='button'
        className='close-up-button'
        aria-expanded={open}
        title={open ? 'Hide close up' : 'Show close up'}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <span aria-hidden='true'>&#128269;</span> Close up
      </button>
      {open && (
        <div className='close-up-map'>
          <MapContainer
            center={center}
            zoom={CLOSE_UP_ZOOM}
            minZoom={CLOSE_UP_ZOOM}
            maxZoom={CLOSE_UP_ZOOM}
            dragging={false}
            touchZoom={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            boxZoom={false}
            keyboard={false}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url={tileLayer} maxNativeZoom={MAX_NATIVE_ZOOM} />
            <CircleMarker
              center={center}
              radius={5}
              interactive={false}
              pathOptions={{
                color: '#ffffff',
                weight: 2,
                fillColor: '#ff0000',
                fillOpacity: 1,
              }}
            />
          </MapContainer>
        </div>
      )}
    </div>
  );
}

export default CloseUp;
