import { useEffect, useState, type ReactNode } from "react";
import {
  MapContainer,
  Marker,
  Popup,
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
  mapContainerProps: MapContainerProps;
}

function MapView(props: MapProps) {
  return (
    <>
      <MapContainer {...props.mapContainerProps}>
        <TileLayer attribution={props.attribution} url={props.tileLayer} />
        {props.isMarkerEnabled ? <LocationMarker /> : null}
      </MapContainer>
    </>
  );
}

export default MapView;
