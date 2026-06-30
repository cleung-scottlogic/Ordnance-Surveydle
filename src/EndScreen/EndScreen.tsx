import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import './EndScreen.css';
import { type MapContainerProps } from 'react-leaflet';
import type { LatLng } from 'leaflet';
import { DataService } from '../DataService';

import MapView from '../Map/MapView';

function EndScreen({ open, startingMarker }: { open: boolean; startingMarker?: LatLng }) {
  const osmMapContainerProps: MapContainerProps = {
    center: startingMarker,
    zoomControl: true,
    zoom: 7,
  };

  return (
    <>
      <Dialog className="end-screen" open={open}>
        <DialogTitle className="title">Game Over</DialogTitle>
        <div className="end-screen-content">
          <MapView
            mapContainerProps={osmMapContainerProps}
            tileLayer={DataService.osmTileLayer}
            attribution={DataService.osmAttribution}
            fixedMarker={startingMarker}
            zoomToFixedMarker={14}
          />
        </div>
      </Dialog>
    </>
  );
}

export default EndScreen;
