import { useEffect } from "react";
import Map from "ol/Map.js";
import View from "ol/View";
import OSM from "ol/source/OSM";
import TileLayer from "ol/layer/Tile";
import "./MapView.css";

function MapView() {
  useEffect(() => {
    const map = new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    return () => {
      map.setTarget();
    };
  }, []);

  return <div id='map' className='map'></div>;
}

export default MapView;
