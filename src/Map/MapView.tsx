import {
  MapContainer,
  TileLayer,
  ZoomControl,
  useMap,
  type MapContainerProps,
} from 'react-leaflet';
import './MapView.css';
import LocationMarker from './LocationMarker';
import L, { type ControlPosition, type LatLng } from 'leaflet';
import { useEffect, useRef } from 'react';

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
  /** render the zoom control at a specific corner (disables the default control) */
  zoomControlPosition?: ControlPosition;
  /** show a button that recenters the map on the fixedMarker */
  enableRecenter?: boolean;
  /** pan the map to a location; bump nonce to re-trigger for the same location */
  panTo?: { location: LatLng; nonce: number };
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

// A button that recenters the map on the given target when clicked.
function RecenterButton({ target, zoom }: { target: LatLng; zoom?: number }) {
  const map = useMap();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!buttonRef.current) return;
    // Stop clicks/scrolls on the button from reaching the map underneath.
    L.DomEvent.disableClickPropagation(buttonRef.current);
    L.DomEvent.disableScrollPropagation(buttonRef.current);
  }, []);

  const handleClick = () => {
    map.flyTo([target.lat, target.lng], zoom ?? map.getZoom());
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      className="recenter-button"
      aria-label="Recentre on marker"
      title="Recentre on marker"
      onClick={handleClick}
    >
      Recentre
    </button>
  );
}

// Pans the map to a requested location whenever the request changes.
function PanController({ panTo }: { panTo?: { location: LatLng; nonce: number } }) {
  const map = useMap();

  useEffect(() => {
    if (!panTo) return;
    map.panTo([panTo.location.lat, panTo.location.lng]);
  }, [map, panTo]);

  return null;
}

// Keep Leaflet in sync when its container is resized (e.g. dragging the map divider).
function ResizeInvalidator() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  return null;
}

function MapView(props: MapProps) {
  return (
    <>
      <MapContainer {...props.mapContainerProps}>
        <TileLayer attribution={props.attribution} url={props.tileLayer} />
        <ResizeInvalidator />
        {props.zoomControlPosition ? <ZoomControl position={props.zoomControlPosition} /> : null}
        {props.enableRecenter && props.fixedMarker ? (
          <RecenterButton target={props.fixedMarker} zoom={props.zoomToFixedMarker} />
        ) : null}
        {props.panTo ? <PanController panTo={props.panTo} /> : null}
        {props.fixedMarker ? (
          <MapController
            fixedMarker={props.fixedMarker}
            zoom={props.zoomToFixedMarker}
            autoFly={props.autoFlyToFixedMarker}
          />
        ) : null}
        {props.fixedMarker || props.isCustomMarkerEnabled || props.existingMarkers?.length ? (
          <LocationMarker
            setCurrentLocation={props.setCurrentMarkerLocation || (() => {})}
            existingLocations={props.existingMarkers}
            closestLocation={props.closestMarker}
            correctLocation={props.fixedMarker}
            isInteractive={props.isCustomMarkerEnabled}
          />
        ) : null}
      </MapContainer>
    </>
  );
}

export default MapView;
