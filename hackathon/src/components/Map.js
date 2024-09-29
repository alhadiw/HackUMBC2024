import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
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

const ScorePopup = ({ position, scores, image, onClose }) => {
    if (!position || scores.length === 0) {
        return null;  // Don't render the popup if no position or no scores
    }

    return (
        <div className="popup-container">
            <div className="popup-content">
                <button className="close-button" onClick={onClose}>
                    &times;
                </button>
                <h3>Scores at Location</h3>
                <ul>
                    {scores.map((score, index) => (
                        <li key={index}>Score: {score}</li>
                    ))}
                </ul>
                <p>Latitude: {position.lat.toFixed(5)}</p>
                <p>Longitude: {position.lng.toFixed(5)}</p>
                {image && <img src={image} alt="Location" className="location-image" />}
            </div>
        </div>
    );
};

const ShowScorePopup = () => {
    const [popupData, setPopupData] = useState({
        position: null,
        scores: [],
        image: null
    });

    const showScorePopup = (position, scores, image) => {
        setPopupData({
            position: position,
            scores: scores,
            image: image
        });
    };

    const closePopup = () => {
        setPopupData({
            position: null,
            scores: [],
            image: null
        });
    };

    return (
        <div>
            <MapComponent showScorePopup={showScorePopup} />
            <ScorePopup position={popupData.position} scores={popupData.scores} image={popupData.image} onClose={closePopup} />
        </div>
    );
};

const MapComponent = ({ showScorePopup }) => {
    const [position, setPosition] = useState(null);
    const [heatmapData, setHeatmapData] = useState([]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (location) => {
                const { latitude, longitude } = location.coords;
                setPosition([latitude, longitude]);
            },
            (error) => {
                console.error("Error getting the user's location: ", error);
                setPosition([39.25, -76.713]);
            }
        );
        
        fetch("http://127.0.0.1:5000/api/get-environment-data")
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const heatData = data.map(item => [item.latitude, item.longitude, item.score / 10, item.image]); // Including image
            setHeatmapData(heatData);
        })
        .catch((error) => console.error("Error fetching heatmap data:", error));
    }, []);

    if (!position) {
        return <p>Loading...</p>;
    }

    return (
        <MapContainer center={position} zoom={13} style={{ height: "100vh", width: "100%" }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {heatmapData.length > 0 && <HeatmapLayer points={heatmapData} showScorePopup={showScorePopup} />}
        </MapContainer>
    );
};

const HeatmapLayer = ({ points, showScorePopup }) => {
    const map = useMap();

    useEffect(() => {
        if (points.length > 0) {
            const heat = L.heatLayer(points.map(([lat, lng, score]) => [lat, lng, score]), { 
                radius: 40,
                blur: 25,
                maxZoom: 17,
                gradient: {  
                    0.0: 'red',
                    0.5: 'yellow',
                    1.0: 'green'
                }
            }).addTo(map);

            map.on('click', (e) => {
                const { lat, lng } = e.latlng;
                const nearbyPoints = points.filter(([pointLat, pointLng]) => {
                    const distance = map.distance([lat, lng], [pointLat, pointLng]);
                    return distance < 50;
                });

                if (nearbyPoints.length > 0) {
                    const scores = nearbyPoints.map(([lat, lng, score]) => score * 10);
                    const image = nearbyPoints[0][3];  // Get the image from the first nearby point
                    showScorePopup(e.latlng, scores, image);
                } else {
                    showScorePopup(null, [], null);
                }
            });

            return () => {
                map.removeLayer(heat);
            };
        }
    }, [points, map, showScorePopup]);

    return null;
};

export default ShowScorePopup;