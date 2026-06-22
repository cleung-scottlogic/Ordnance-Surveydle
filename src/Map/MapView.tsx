import {
  MapContainer,
  Marker,
  TileLayer,
  type MapContainerProps,
} from "react-leaflet";
import "./MapView.css";
import LocationMarker from "./LocationMarker";
import type { LatLng, LatLngExpression } from "leaflet";

interface MapProps {
  tileLayer: string;
  attribution?: string;
  isMarkerEnabled?: boolean;
  fixedMarker?: LatLng;
  mapContainerProps: MapContainerProps;
  setCurrentMarkerLocation?: (guess: LatLng) => void;
}

function MapView(props: MapProps) {
  return (
    <>
      <MapContainer {...props.mapContainerProps}>
        <TileLayer attribution={props.attribution} url={props.tileLayer} />
        {props.fixedMarker ? <Marker position={props.fixedMarker} /> : null}
        {props.isMarkerEnabled ? (
          <LocationMarker
            setCurrentLocation={props.setCurrentMarkerLocation!}
          />
        ) : null}
      </MapContainer>
    </>
  );
}

export default MapView;
