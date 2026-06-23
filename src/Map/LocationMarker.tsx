import { type LatLng } from 'leaflet';
import { useState } from 'react';
import { Marker, useMapEvents } from 'react-leaflet';

interface LocationMarkerProps {
  existingLocations: LatLng[] | undefined;
  setCurrentLocation: (setCurrentLocation: LatLng) => void;
}

function LocationMarker(props: LocationMarkerProps) {
  const [position, setPosition] = useState<LatLng | null>(null);
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      props.setCurrentLocation(e.latlng);
    },
  });

  const getMarkers = () => {
    if (props.existingLocations === void 0) return null;
    return (
      <>
        {props.existingLocations.map((l: LatLng) => (
          <Marker position={l} />
        ))}
      </>
    );
  };

  return (
    <>
      {getMarkers()}
      {position === null ? null : <Marker position={position}></Marker>}
    </>
  );
}

export default LocationMarker;
