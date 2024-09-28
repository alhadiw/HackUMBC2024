from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configure the SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///items.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Define the Item model
class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    latitude = db.Column(db.String, nullable=False)
    longitude = db.Column(db.String, nullable=False)
    personal_rating = db.Column(db.String, nullable=False)
    date_taken = db.Column(db.String, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'personal_rating': self.personal_rating,
            'date_taken': self.date_taken
        }

# Create the database
with app.app_context():
    db.create_all()

@app.route('/api/items', methods=['GET'])
def get_items():
    items = Item.query.all()
    return jsonify([item.to_dict() for item in items])

@app.route('/api/items', methods=['POST'])
def add_item():
    data = request.json
    if data:
        new_item = Item(
            latitude=data['latitude'],
            longitude=data['longitude'],
            personal_rating=data['personal_rating'],
            date_taken=data['date_taken']
        )
        db.session.add(new_item)
        db.session.commit()
        return jsonify({"message": "Item added"}), 201
    return jsonify({"error": "No item provided"}), 400

if __name__ == '__main__':
    app.run(debug=True)
