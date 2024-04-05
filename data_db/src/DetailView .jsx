// DetailView.jsx
import React from 'react';
import { Link, useParams } from 'react-router-dom';

const DetailView = ({ weatherData }) => {
  const { index } = useParams();
  const selectedItem = weatherData[index];

  if (!selectedItem) {
    return <div>No data found for this index.</div>;
  }

  const weatherDate = new Date(selectedItem.dt * 1000).toLocaleDateString();
  const sunsetTime = new Date(selectedItem.sunset * 1000).toLocaleTimeString();

  return (
    <div>
      <h2>Weather Details for {selectedItem.city_name}</h2>
      
      <p>Temperature: {selectedItem.temp} °C</p>
      <p>Sunset: {sunsetTime}</p>
      <p>Description: {selectedItem.weather.description}</p>
      <Link to="/">Back to List</Link>
    </div>
  );
};

export default DetailView;