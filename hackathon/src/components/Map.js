// src/components/Map.js
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Map.css'

// Fix default marker icon issue in Leaflet with Webpack
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent = () => {
    const [position, setPosition] = useState(null);

    useEffect(() => {
        // Ask for the user's location
        navigator.geolocation.getCurrentPosition(
            (location) => {
                const { latitude, longitude } = location.coords;
                setPosition([latitude, longitude]); // Set the user's current location
            },
            (error) => {
                console.error("Error getting the user's location: ", error);
                setPosition([39.25, -76.713]); // Fallback location (e.g., London)
            }
        );
    }, []);

    if (!position) {
        return <p>Loading...</p>; // Show a loading message until the location is obtained
    }

    console.log(position);

    return (
        <MapContainer center={position} zoom={13} style={{ height: "100vh", width: "100%" }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position}>
                <Popup>Your current location.</Popup>
            </Marker>
        </MapContainer>
    );
};

export default MapComponent;
