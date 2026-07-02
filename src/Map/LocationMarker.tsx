import { type LatLng } from 'leaflet';
import L from 'leaflet';
import { useState } from 'react';
import { Marker, useMapEvents } from 'react-leaflet';

// Red marker icon for the correct location using SVG data URL
const redMarkerIcon = new L.Icon({
  iconUrl:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSI0MSIgdmlld0JveD0iMCAwIDI1IDQxIj48cGF0aCBmaWxsPSIjZmYwMDAwIiBkPSJNMTIuNSAwQzUuNTk2IDAgMCA1LjU5NiAwIDEyLjVjMCA4LjMzMyAxMi41IDI4LjMzMyAxMi41IDI4LjMzM3MxMi41LTIwIDEyLjUtMjguMzMzQzI1IDUuNTk2IDE5LjQwNCAwIDEyLjUgMHptMCA4LjMzM2E0LjE2NyA0LjE2NyAwIDEgMSAwIDguMzM0IDQuMTY3IDQuMTY3IDAgMCAxIDAtOC4zMzR6Ii8+PC9zdmc+',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationMarkerProps {
  existingLocations: LatLng[] | undefined;
  setCurrentLocation: (setCurrentLocation: LatLng) => void;
  closestLocation?: LatLng;
  correctLocation?: LatLng;
  isInteractive?: boolean;
}

function LocationMarker(props: LocationMarkerProps) {
  const [position, setPosition] = useState<LatLng | null>(null);

  useMapEvents({
    click(e) {
      if (!props.isInteractive) return;
      setPosition(e.latlng);
      props.setCurrentLocation(e.latlng);
    },
  });

  const getMarkers = () => {
    if (props.existingLocations === void 0) return null;
    return (
      <>
        {props.existingLocations.map((l: LatLng, idx) => {
          const isClosest = props.closestLocation && l.equals(props.closestLocation);
          const opacity = isClosest ? 1 : 0.4;
          return <Marker key={idx} opacity={opacity} position={l} />;
        })}
      </>
    );
  };

  return (
    <>
      {props.correctLocation ? (
        <Marker position={props.correctLocation} icon={redMarkerIcon} />
      ) : null}
      {getMarkers()}
      {position === null ? null : <Marker position={position}></Marker>}
    </>
  );
}

export default LocationMarker;
