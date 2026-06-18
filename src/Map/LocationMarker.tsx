import type { LatLng } from "leaflet";
import { useState } from "react";
import { Marker, useMapEvents } from "react-leaflet";

function LocationMarker({ fixedPosition }: { fixedPosition?: LatLng }) {
  if (fixedPosition) {
    return <Marker position={fixedPosition}></Marker>;
  }

  const [position, setPosition] = useState<LatLng | null>(null);
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
}

export default LocationMarker;
