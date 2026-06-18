import { MapContainer, TileLayer, type MapContainerProps } from "react-leaflet";
import "./MapView.css";
import LocationMarker from "./LocationMarker";
import type { LatLng } from "leaflet";

interface MapProps {
  tileLayer: string;
  attribution?: string;
  isMarkerEnabled?: boolean;
  fixedMarker?: LatLng;
  mapContainerProps: MapContainerProps;
}

function MapView(props: MapProps) {
  return (
    <>
      <MapContainer {...props.mapContainerProps}>
        <TileLayer attribution={props.attribution} url={props.tileLayer} />
        {props.isMarkerEnabled ? (
          <LocationMarker fixedPosition={props.fixedMarker} />
        ) : null}
      </MapContainer>
    </>
  );
}

export default MapView;
