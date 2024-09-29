// src/components/Map.js
/*
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

export default MapComponent; */

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';
import './Map.css';

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
    const [heatmapData, setHeatmapData] = useState([]); // Store heatmap data

    useEffect(() => {
        // Ask for the user's location
        navigator.geolocation.getCurrentPosition(
            (location) => {
                const { latitude, longitude } = location.coords;
                setPosition([latitude, longitude]); // Set the user's current location
            },
            (error) => {
                console.error("Error getting the user's location: ", error);
                setPosition([39.25, -76.713]); // Fallback location
            }
        );
        
        // Fetch heatmap data from the Flask backend
        fetch("http://127.0.0.1:5000/api/get-environment-data")  // Full URL to the Flask backend
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const heatData = data.map(item => [item.latitude, item.longitude, item.score / 10]);
            console.log("Heatmap Data:", heatData);  // Debugging
            setHeatmapData(heatData);
        })
        .catch((error) => console.error("Error fetching heatmap data:", error));
}, []);


    if (!position) {
        return <p>Loading...</p>; // Show a loading message until the location is obtained
    }

    return (
        <MapContainer center={position} zoom={13} style={{ height: "100vh", width: "100%" }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position}>
                <Popup>Your current location.</Popup>
            </Marker>
            {heatmapData.length > 0 && <HeatmapLayer points={heatmapData} />} {/* Add heatmap */}
        </MapContainer>
    );
};

// Separate component for adding the heatmap
const HeatmapLayer = ({ points }) => {
    const map = useMap();

    useEffect(() => {
        if (points.length > 0) {
            // Initialize heatmap layer with better visibility and larger radius
            const heat = L.heatLayer(points, { 
                radius: 40,  // Increase radius for bigger size
                blur: 25,    // Set appropriate blur to make it smooth
                maxZoom: 17, // Make sure the heatmap displays well at higher zoom levels
                gradient: {  // Custom gradient for color scale
                    0.0: 'red',   // 0 - 1 is the intensity scale (red = low, green = high)
                    0.5: 'yellow',
                    1.0: 'green'
                }
            }).addTo(map);

            return () => {
                map.removeLayer(heat); // Clean up heatmap layer on component unmount
            };
        }
    }, [points, map]);

    return null; // Heatmap is added directly to the map
};

export default MapComponent;

