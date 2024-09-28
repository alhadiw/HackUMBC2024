from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = './uploads'  # Define the folder to store images
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/api/upload', methods=['POST'])
def upload_image():
    image = request.form['image']
    date_taken = request.form['date']
    latitude = request.form['latitude']
    longitude = request.form['longitude']

    # Decode the base64 image and save it to the server
    image_data = base64.b64decode(image.split(',')[1])
    filename = f'image_{date_taken.replace("/", "-").replace(":", "-")}.jpg'
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    
    with open(filepath, 'wb') as f:
        f.write(image_data)

    # You can store the latitude, longitude, and filename in a database if necessary
    print(f'Location: Latitude: {latitude}, Longitude: {longitude}')
    print(f'Image saved as: {filename}')

    return jsonify({"message": "Image uploaded successfully", "filename": filename, "latitude": latitude, "longitude" longitude}):
