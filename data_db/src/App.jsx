import React, { useState, useEffect } from 'react';
import './App.css';

const API_KEY = 'a84fd91260647e7756c3109ffccaf2cf';
const Cities = ['Raleigh', 'New York', 'Los Angeles', 'Chicago', 'Ohio', 'Puerto Rico', 'Boston'];

function App() {
  const [weatherData, setWeatherData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const promises = Cities.map(async (city) => {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to fetch data for ${city}: ${errorData.error || 'Unknown error'}`);
          }

          const json = await response.json();
          return {
            city_name: json.name,
            temp: json.main.temp,
            wind_spd: json.wind.speed,
            weather: {
              description: json.weather[0].description}};

        });

        const allData = await Promise.all(promises);
        const flattenedData = allData.flat();
        setWeatherData(flattenedData);
        setFilteredData(flattenedData);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching weather data:', error);
      }
    };

    fetchWeatherData();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    filterData(event.target.value);
  };

  const filterData = (searchTerm) => {
    if (!searchTerm) {
      setFilteredData(weatherData); 
    } else {
      const filtered = weatherData.filter(item =>
        item.city_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  return (
    <div className="whole-page">
      <h1>Weather</h1>
      <input
        type="text"
        placeholder="Search City..."
        value={searchTerm}
        onChange={handleSearchChange}
      />

      {error ? (
        <p>Error: {error}</p>
      ) : weatherData.length > 0 ? (
        <div>
          
          <div className="Summary container">
          <h2>Summary Data Statistics</h2>
          <div className="cities-container">
            <div className="cities">
              <p>Total Number of Cities: {filteredData.length}</p>
            </div>
            <div className="cities">
              <p>Highest Wind Speed: {Math.max(...filteredData.map(item => item.wind_spd))}</p>
            </div>
            <div className="cities">
              <p>Lowest Wind Speed: {Math.min(...filteredData.map(item => item.wind_spd))}</p>
            </div>
          </div>
          </div>

          <h2>List of Data</h2>
          <div className="data-container"> 
          <div className='header'>
          <div className="data-row">
            <p>City</p>
            <p>Temperature</p>
            <p>Wind Speed</p>
            <p>Description</p>
            
          </div>
          </div>
          {filteredData.map((item, index) => (
            <div className="data-row" key={index}>
              <p>{item.city_name}</p>
              <p>{item.temp} °C</p>
              <p>{item.wind_spd} m/s</p>
              <p>{item.weather.description}</p>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <p>Loading...</p>
    )}
  </div>
  );
}

export default App;