import { useState } from "react";
import "./App.css";
import MapView from "./Map/MapView";

function App() {
  const [count, setCount] = useState(0);

  const osmTileLayer = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  // https://cloud.maptiler.com/tiles/uk-osgb1888/
  const historicalTileLayer =
    "https://api.maptiler.com/tiles/uk-osgb1888/{z}/{x}/{y}?key=";
  const key = "fIGLURh5nxHfE0ydIxke";
  const historicalAttribution = `<a href="http://maps.nls.uk/projects/subscription-api/">National Library of Scotland</a>`;

  return (
    <>
      <section id='center'>
        <MapView
          center={[51.505, -0.09]}
          tileLayer={`${historicalTileLayer}${key}`}
          attribution={historicalAttribution}
        ></MapView>
        <MapView
          center={[51.505, -0.09]}
          tileLayer={osmTileLayer}
          attribution={
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        ></MapView>
      </section>
    </>
  );
}

export default App;
