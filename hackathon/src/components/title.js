// src/App.js
import React from 'react';
import "./title.css"
import MapComponent from './Map';
import logo from './assets/Photograss_Logo.png'
import title from './assets/Photograss_title.png'
import TakePictureButton from './TakePictureButton';

function Title() {
  return (
    <div className="app-container">
        <div className='Title-container'>
            <img src={logo} alt="logo"/>
            <img src={title} alt="title"/>

        </div>
        <div className='map-container'>
            <MapComponent />
            <TakePictureButton />
        </div>
    </div>
  );
}

export default Title;
