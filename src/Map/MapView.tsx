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
  /** explicitly enable programmatic fly/pan-to when a fixed marker is present */
  autoFlyToFixedMarker?: boolean;
  /** closest marker to highlight in LocationMarker */
  closestMarker?: LatLng;
}

function MapController({
  fixedMarker,
  zoom,
  autoFly,
}: {
  fixedMarker?: LatLng;
  zoom?: number;
  autoFly?: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !fixedMarker) return;

    try {
      map.invalidateSize();
    } catch (e) {
      console.log('MapController: map.invalidateSize() failed', e);
      // ignore
    }

    if (!autoFly) return;

    if (typeof zoom !== 'undefined') {
      try {
        map.flyTo([fixedMarker.lat, fixedMarker.lng], zoom);
      } catch (e) {
        console.log('MapController: map.flyTo() failed, falling back to setView()', e);
        map.setView([fixedMarker.lat, fixedMarker.lng], zoom);
      }
    } else {
      try {
        map.panTo([fixedMarker.lat, fixedMarker.lng]);
      } catch (e) {
        console.log('MapController: map.panTo() failed, falling back to setView()', e);
        map.setView([fixedMarker.lat, fixedMarker.lng], map.getZoom());
      }
    }
  }, [map, fixedMarker, zoom, autoFly]);

  return null;
}

function MapView(props: MapProps) {
  return (
    <>
      <MapContainer {...props.mapContainerProps}>
        <TileLayer attribution={props.attribution} url={props.tileLayer} />
        {props.fixedMarker ? <Marker position={props.fixedMarker} /> : null}
        {props.fixedMarker ? (
          <MapController
            fixedMarker={props.fixedMarker}
            zoom={props.zoomToFixedMarker}
            autoFly={props.autoFlyToFixedMarker}
          />
        ) : null}
        {props.isCustomMarkerEnabled || props.existingMarkers ? (
          <LocationMarker
            setCurrentLocation={props.setCurrentMarkerLocation || (() => {})}
            existingLocations={props.existingMarkers}
            closestLocation={props.closestMarker}
          />
        ) : null}
      </MapContainer>
    </>
  );
}

export default MapView;
