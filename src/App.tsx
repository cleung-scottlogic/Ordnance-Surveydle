import { useState } from "react";
import "./App.css";
import MapView from "./Map/MapView";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <section id='center'>
        <button
          type='button'
          className='counter'
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
        <MapView></MapView>
      </section>
    </>
  );
}

export default App;
