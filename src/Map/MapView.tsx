import { useEffect, useState, type ReactNode } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "./MapView.css";
import LocationMarker from "./LocationMarker";
import type { LatLng, LatLngExpression } from "leaflet";

interface MapProps {
  center: LatLngExpression;
  tileLayer: string;
  attribution?: string;
  zoom?: number;
}

function MapView(props: MapProps) {
  let center = props.center;
  let source = props.tileLayer;
  let attribution = props.attribution;
  let zoom = props.zoom ?? 13;

  return (
    <>
      <MapContainer center={center} zoom={zoom}>
        <TileLayer attribution={attribution} url={source} />
        <LocationMarker />
      </MapContainer>
    </>
  );
}

export default MapView;
