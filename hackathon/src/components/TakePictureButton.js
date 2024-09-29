// src/components/TakePictureButton.js
import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import './TakePictureButton.css';

const TakePictureButton = () => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [imageDate, setImageDate] = useState(null);
  const [location, setLocation] = useState(null); // Store user location
  const [errorMessage, setErrorMessage] = useState(null); // Handle errors (like location denied)
  const webcamRef = useRef(null);

  // Function to get user location
  const getLocationAndOpenCamera = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setIsCameraOpen(true); // Open the camera if location is successfully obtained
        setErrorMessage(null); // Clear any error messages
      },
      (error) => {
        setErrorMessage('Location access is required to take a picture.');
        console.error('Error getting location:', error);
      }
    );
  };

  // Function to capture the image
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot(); // Capture the image
    setImageSrc(imageSrc); // Set the captured image
    const currentDate = new Date().toLocaleString(); // Get the current date and time
    setImageDate(currentDate); // Set the date the picture was taken
    setIsCameraOpen(false); // Close the camera after capturing
  };

  // Function to handle recapturing
  const recapture = () => {
    setImageSrc(null);
    setImageDate(null);
    setIsCameraOpen(true); // Reopen the camera
  };

  // Function to handle uploading the image
  const uploadImage = () => {
    // Prepare data to be sent to the backend
    const formData = new FormData();
    formData.append('image', imageSrc); // Append the image
    formData.append('date', imageDate); // Append the date
    formData.append('latitude', location.latitude); // Append latitude
    formData.append('longitude', location.longitude); // Append longitude

    // Send the image, date, and location to the backend
    fetch('http://127.0.0.1:5000/api/upload', {
      method: 'POST',
      body: formData,
    })
    .then((response) => response.json())
    .then((data) => {
      console.log('Upload success:', data);
      // Reset the states to go back to the map view
      setImageSrc(null); // Clear the image
      setImageDate(null); // Clear the date
      setLocation(null); // Clear the location
    })
    .catch((error) => {
      console.error('Upload error:', error);
    });
  };

  return (
    <div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {isCameraOpen && (
        <div className="camera">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="webcam"
          />
          <button onClick={capture} className="capture-button">Capture</button>
        </div>
      )}

      {!isCameraOpen && imageSrc && (
        <div className="image-preview-overlay">
          <div className="image-preview-container">
            <img src={imageSrc} alt="Captured" className="captured-image" />
            <p>Taken on: {imageDate}</p>
            <div className="button-group">
              <button onClick={uploadImage} className="upload-button">Upload</button>
              <button onClick={recapture} className="recapture-button">Recapture</button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Plus Button */}
      <div className="add-button">
        <span className="plus-icon" onClick={getLocationAndOpenCamera}>+</span>
      </div>
    </div>
  );
};

export default TakePictureButton;
