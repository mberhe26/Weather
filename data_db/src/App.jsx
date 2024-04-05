import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Chart from 'chart.js/auto';

import DetailView from './DetailView .jsx';
import './App.css';

const API_KEY = 'a84fd91260647e7756c3109ffccaf2cf';
const Cities = ['Raleigh', 'New York', 'Los Angeles', 'Chicago', 'Ohio', 'Puerto Rico', 'Boston'];

function App() {
  const [weatherData, setWeatherData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  const [minTemp, setMinTemp] = useState(null);
  const [maxTemp, setMaxTemp] = useState(null);
  const [minSunset, setMinSunset] = useState(null);
  const [maxSunset, setMaxSunset] = useState(null);

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
            sunrise: json.sys.sunrise,
            sunset: json.sys.sunset,
            weather: {
              description: json.weather[0].description
            }
          };
        });

        const allData = await Promise.all(promises);
        const flattenedData = allData.flat();
        setWeatherData(flattenedData);
        setFilteredData(flattenedData);

        // Create the chart after the data is fetched and filtered
        createTemperatureChart(flattenedData);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching weather data:', error);
      }
    };

    fetchWeatherData();
  }, []);

  const createTemperatureChart = (data) => {
    const averageTemperatures = Cities.map(city => {
      const cityData = data.filter(item => item.city_name === city);
      const totalTemp = cityData.reduce((acc, cur) => acc + cur.temp, 0);
      return {
        city: city,
        averageTemp: totalTemp / cityData.length
      };
    });

    const ctx = document.getElementById('temperatureChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: averageTemperatures.map(city => city.city),
        datasets: [{
          label: 'Average Temperature (°C)',
          data: averageTemperatures.map(city => city.averageTemp),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 200, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  };

  const filterData = (searchTerm, minTemp, maxTemp, minWindSpeed, maxWindSpeed, minSunrise, maxSunrise, minSunset, maxSunset) => {
    let filtered = weatherData;

    // Filter by city name
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.city_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by temperature
    if (minTemp !== null && maxTemp !== null) {
      filtered = filtered.filter(item =>
        item.temp >= minTemp && item.temp <= maxTemp
      );
    }

    // Filter by wind speed
    if (minWindSpeed !== null && maxWindSpeed !== null) {
      filtered = filtered.filter(item =>
        item.wind_spd >= minWindSpeed && item.wind_spd <= maxWindSpeed
      );
    }

    // Filter by sunrise
    if (minSunrise !== null && maxSunrise !== null) {
      filtered = filtered.filter(item =>
        item.sunrise >= minSunrise && item.sunrise <= maxSunrise
      );
    }

    // Filter by sunset
    if (minSunset !== null && maxSunset !== null) {
      filtered = filtered.filter(item =>
        item.sunset >= minSunset && item.sunset <= maxSunset
      );
    }

    setFilteredData(filtered);
  };

  const handleSearchChange = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);
    filterData(searchTerm, minTemp, maxTemp, minWindSpeed, maxWindSpeed, minSunrise, maxSunrise, minSunset, maxSunset);
  };

  const handleTempRangeChange = (event) => {
    const [min, max] = event.target.value.split(', ').map(Number);
    setMinTemp(min);
    setMaxTemp(max);
    filterData(searchTerm, min, max, minWindSpeed, maxWindSpeed);
  };

  const handleSunsetRangeChange = (event) => {
    const [min, max] = event.target.value.split(', ').map(Number);
    setMinSunset(min);
    setMaxSunset(max);
    filterData(searchTerm, minTemp, maxTemp, minWindSpeed, maxWindSpeed, minSunrise, maxSunrise, min, max);
  };




  
  

  return (
    <Router>
      <Routes>
        <Route path="/" exact element={
    <div className="whole-page">
      <h1>Weather</h1>
      <input
        type="text"
        placeholder="Search City..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
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
      <div>
        <label>Temperature Range:</label>
        <input
          type="text"
          placeholder="Min,Max"
          value={`${minTemp || ''}, ${maxTemp || ''}`}
          onChange={handleTempRangeChange}
        />
      </div>

      <div>
        <label>Sunset Range:</label>
        <input
          type="text"
          placeholder="Min,Max"
          value={`${minSunset || ''}, ${maxSunset || ''}`}
          onChange={handleSunsetRangeChange}
        />
      </div>

      <div>
        <canvas id="temperatureChart" width="400" height="200"></canvas>
      </div>

      <h2>List of Data</h2>
      <div className="data-container">
        <div className='header'>
          <div className="data-row">
            <p>City</p>
            <p>Temperature</p>
            <p>Wind Speed</p>
            <p>Description</p>
            <p>Sunset</p>
          </div>
        </div>
        {filteredData.map((item, index) => (
                <div className="data-row" key={index}>
                  
                    <p>{item.city_name}</p>
                    <p>{item.temp} °C</p>
                    <p>{item.wind_spd} m/s</p> 
                    <Link to={`/detail/${index}`} >

                    <p>🔗 </p>
                    </Link>
                    <p>{new Date(item.sunset * 1000).toLocaleTimeString()}</p>
                 
                </div>
        ))}
      </div>
    </div>
        }/>
       <Route path="/detail/:index" element={<DetailView weatherData={weatherData} />} />
     </Routes>
   </Router>
 );
}


export default App;