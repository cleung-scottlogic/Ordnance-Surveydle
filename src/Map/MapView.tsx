import { MapContainer, Marker, TileLayer, useMap, type MapContainerProps } from 'react-leaflet';
import './MapView.css';
import LocationMarker from './LocationMarker';
import type { LatLng } from 'leaflet';
import { useEffect } from 'react';

interface MapProps {
  tileLayer: string;
  attribution?: string;
  isCustomMarkerEnabled?: boolean;
  fixedMarker?: LatLng;
  existingMarkers?: LatLng[];
  mapContainerProps: MapContainerProps;
  setCurrentMarkerLocation?: (guess: LatLng) => void;
  /** optional zoom level to use when zooming to fixedMarker */
  zoomToFixedMarker?: number;
}

function MapController({ fixedMarker, zoom }: { fixedMarker?: LatLng; zoom?: number }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !fixedMarker) return;
    try {
      // Use flyTo for a smooth zoom animation; fallback to setView if not supported
      map.flyTo([fixedMarker.lat, fixedMarker.lng], zoom ?? 13);
    } catch (e) {
      map.setView([fixedMarker.lat, fixedMarker.lng], zoom ?? 13);
    }
  }, [map, fixedMarker, zoom]);

  return null;
}

function MapView(props: MapProps) {
  return (
    <>
      <MapContainer {...props.mapContainerProps}>
        <TileLayer attribution={props.attribution} url={props.tileLayer} />
        {props.fixedMarker ? <Marker position={props.fixedMarker} /> : null}
        {props.fixedMarker ? (
          <MapController fixedMarker={props.fixedMarker} zoom={props.zoomToFixedMarker} />
        ) : null}
        {props.isCustomMarkerEnabled ? (
          <LocationMarker
            setCurrentLocation={props.setCurrentMarkerLocation!}
            existingLocations={props.existingMarkers}
          />
        ) : null}
      </MapContainer>
    </>
  );
}

export default MapView;
