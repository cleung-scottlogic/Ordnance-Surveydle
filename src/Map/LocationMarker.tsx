import type { LatLng } from "leaflet";
import { useState } from "react";
import { Marker, useMapEvents } from "react-leaflet";

interface LocationMarkerProps {
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

  return position === null ? null : <Marker position={position}></Marker>;
}

export default LocationMarker;
