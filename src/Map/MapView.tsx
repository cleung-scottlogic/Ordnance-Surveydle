import { MapContainer, Marker, TileLayer, type MapContainerProps } from 'react-leaflet';
import './MapView.css';
import LocationMarker from './LocationMarker';
import type { LatLng } from 'leaflet';

interface MapProps {
  tileLayer: string;
  attribution?: string;
  isCustomMarkerEnabled?: boolean;
  fixedMarker?: LatLng;
  existingMarkers?: LatLng[];
  mapContainerProps: MapContainerProps;
  setCurrentMarkerLocation?: (guess: LatLng) => void;
}

function MapView(props: MapProps) {
  return (
    <>
      <MapContainer {...props.mapContainerProps}>
        <TileLayer attribution={props.attribution} url={props.tileLayer} />
        {props.fixedMarker ? <Marker position={props.fixedMarker} /> : null}
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
