// src/App.js
import React from 'react';
import MapComponent from './components/Map';
import TakePictureButton from './components/TakePictureButton';


function App() {
  return (
    <div className="App">
      <MapComponent />
      <TakePictureButton />
    </div>
  );
}

export default App;
