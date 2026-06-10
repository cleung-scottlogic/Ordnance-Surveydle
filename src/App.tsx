import { useEffect, useState } from 'react'
import Map from 'ol/Map.js';
import './App.css'
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';


function App() {
  const [count, setCount] = useState(0)


  useEffect(() => {
    const map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM(),
        })
      ],
      view: new View({
        center: [0,0],
        zoom: 2,
      }),
    });

    return () => {
      map.setTarget();
    }
  }, []);


  return (
    <>
      <section id="center">
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
        <div id="map" className="map" ></div>
      </section>       
    </>
  )
}

export default App
