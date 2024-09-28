import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [personal_rating, setPersonalRating] = useState('');
    const [date_taken, setDateTaken] = useState('');
    const [items, setItems] = useState([]);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        const response = await axios.get('http://127.0.0.1:5000/api/items');
        setItems(response.data);
    };

    const addItem = async () => {
        if (latitude && longitude && personal_rating && date_taken) {
            const newItem = { latitude, longitude, personal_rating, date_taken };
            try {
                await axios.post('http://127.0.0.1:5000/api/items', newItem);
                // Clear inputs after successful submission
                setLatitude('');
                setLongitude('');
                setPersonalRating('');
                setDateTaken('');
                fetchItems(); // Refresh the list
            } catch (error) {
                console.error("There was an error adding the item!", error);
            }
        } else {
            alert("Please fill in all fields.");
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Item List</h1>
            <div style={{ marginBottom: '10px' }}>
                <input 
                    type="text" 
                    value={latitude} 
                    onChange={(e) => setLatitude(e.target.value)} 
                    placeholder="Latitude" 
                    style={{ marginRight: '5px' }}
                />
                <input 
                    type="text" 
                    value={longitude} 
                    onChange={(e) => setLongitude(e.target.value)} 
                    placeholder="Longitude" 
                    style={{ marginRight: '5px' }}
                />
                <input 
                    type="text" 
                    value={personal_rating} 
                    onChange={(e) => setPersonalRating(e.target.value)} 
                    placeholder="Personal Rating" 
                    style={{ marginRight: '5px' }}
                />
                <input 
                    type="date" 
                    value={date_taken} 
                    onChange={(e) => setDateTaken(e.target.value)} 
                    style={{ marginRight: '5px' }}
                />
                <button onClick={addItem}>Add Item</button>
            </div>
            <h2>Items:</h2>
            <ul>
                {items.map((item) => (
                    <li key={item.id}>
                        Latitude: {item.latitude}, Longitude: {item.longitude}, Rating: {item.personal_rating}, Date Taken: {item.date_taken}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;