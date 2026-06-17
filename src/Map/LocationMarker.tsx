import type { LatLng } from "leaflet";
import { useState } from "react";
import { Marker, Popup, useMapEvents } from "react-leaflet";

function LocationMarker() {
  const [position, setPosition] = useState<LatLng | null>(null);
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
}

export default LocationMarker;
