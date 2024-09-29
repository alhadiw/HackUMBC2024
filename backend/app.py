from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from touchGrass import getText, encode_image
import json
import base64
import os

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///uploads.db'  # Use SQLite for simplicity
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Define the Upload model
class Upload(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(120), nullable=False)
    image_data = db.Column(db.Text, nullable=False)  # Store the base64-encoded image
    date_taken = db.Column(db.String(50), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    score = db.Column(db.Integer, nullable=False)

# Create the database tables
with app.app_context():
    db.create_all()

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
    image_data = base64.b64decode(image.split(',')[1])  # Decode the image for saving
    filename = f'image_{date_taken.replace("/", "-").replace(":", "-")}.jpeg'
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    
    with open(filepath, 'wb') as f:
        f.write(image_data)
        
    #Generate the scores based off the image
    image_64 = encode_image(filepath)
    temp_score = getText(image_64)
    
    text = temp_score.replace("'", '"')
    text = json.loads(text)
    save_score = text[0]["message"]

    # Save the base64 image string in the database
    new_upload = Upload(
        filename=filename,
        image_data=image_64,
        date_taken=date_taken,
        latitude=float(latitude),
        longitude=float(longitude),
        #Scores is to be calculated
        score=save_score
    )
    db.session.add(new_upload)
    db.session.commit()

    print(f'Location: Latitude: {latitude}, Longitude: {longitude}')
    print(f'Image saved as: {filename}')
    print(f'Score saved as: {save_score}')

    return jsonify({"message": "Image uploaded successfully", "filename": filename, "latitude": latitude, "longitude": longitude})

@app.route('/api/uploads', methods=['GET'])
def get_uploads():
    uploads = Upload.query.all()
    result = []
    for upload in uploads:
        result.append({
            "id": upload.id,
            "filename": upload.filename,
            "image_data": f"data:image/jpeg;base64,{upload.image_data}",  # Prepend data URI scheme
            "date_taken": upload.date_taken,
            "latitude": upload.latitude,
            "longitude": upload.longitude,
            "score": upload.score
        })
    return jsonify(result)

@app.route('/api/get-environment-data', methods=['GET'])
def get_environment_data():
    uploads = Upload.query.all()
    result = []
    for upload in uploads:
        result.append({
            "id": upload.id,
            "latitude": upload.latitude,
            "longitude": upload.longitude,
            "image_data": f"data:image/jpeg;base64,{upload.image_data}",
            "score": upload.score
        })
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
