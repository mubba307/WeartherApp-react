import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";
import "./App.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const API_KEY = "519f2ba9f7f69ff116be67375c8339a1"; // apni API key yahan lagayen

export default function App() {
  const [city, setCity] = useState("London");
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [background, setBackground] = useState("");

  useEffect(() => {
    fetchWeather(city);
  }, []);

  const fetchWeather = async (cityName) => {
    try {
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const weatherJson = await weatherRes.json();

      if (weatherJson.cod !== 200) {
        alert("City not found!");
        return;
      }

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const forecastJson = await forecastRes.json();

      setWeatherData(weatherJson);

      // 4 din ke 12:00 pm forecasts nikalte hain
      const dailyForecast = forecastJson.list.filter((item) =>
        item.dt_txt.includes("12:00:00")
      );
      setForecast(dailyForecast.slice(0, 4));

      // Background image set karna
      const condition = weatherJson.weather[0].main;
      if (condition === "Clear") {
        setBackground("https://images.unsplash.com/photo-1506744038136-46273834b3fb");
      } else if (condition === "Clouds") {
        setBackground("https://images.unsplash.com/photo-1499346030926-9a72daac6c63");
      } else if (condition === "Rain") {
        setBackground("https://images.unsplash.com/photo-1501594907352-04cda38ebc29");
      } else if (condition === "Snow") {
        setBackground("https://images.unsplash.com/photo-1608889175663-d9a39c49f4d0");
      } else {
        setBackground("https://images.unsplash.com/photo-1503264116251-35a269479413");
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim() === "") {
      alert("Please enter a city");
      return;
    }
    fetchWeather(city);
  };

  // Chart data prepare karna
  const chartData = {
    labels: forecast.map((day) =>
      new Date(day.dt_txt).toLocaleDateString(undefined, { weekday: "short" })
    ),
    datasets: [
      {
        label: "Temperature (°C)",
        data: forecast.map((day) => day.main.temp),
        borderColor: "#ff7f50",
        backgroundColor: "rgba(255,127,80,0.3)",
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: `4-Day Temperature Forecast for ${city}` },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: false,
        suggestedMin: Math.min(...forecast.map((day) => day.main.temp)) - 5,
        suggestedMax: Math.max(...forecast.map((day) => day.main.temp)) + 5,
      },
    },
  };

  return (
    <div
      className="app"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        padding: "20px",
        color: "white",
      }}
    >
      <div className="container">
        <h1 className="title">🌦 Weather App with Graph</h1>
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city..."
          />
          <button type="submit">Search</button>
        </form>

        {weatherData && (
          <div className="weather-card">
            <h2>{weatherData.name}</h2>
            <img
              src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
              alt="icon"
            />
            <p>{weatherData.weather[0].description.toUpperCase()}</p>
            <p>🌡 {Math.round(weatherData.main.temp)}°C</p>
            <p>💨 {weatherData.wind.speed} m/s</p>
          </div>
        )}

        {forecast.length > 0 && <h2 className="forecast-title">Next 4 Days</h2>}

        <div className="forecast-container">
          {forecast.map((day, index) => (
            <div key={index} className="forecast-card">
              <p>{new Date(day.dt_txt).toLocaleDateString()}</p>
              <img
                src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                alt="icon"
              />
              <p>{day.weather[0].description.toUpperCase()}</p>
              <p>🌡 {Math.round(day.main.temp)}°C</p>
            </div>
          ))}
        </div>

        {forecast.length > 0 && (
          <div style={{ marginTop: "40px", backgroundColor: "rgba(0,0,0,0.4)", padding: "15px", borderRadius: "10px" }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
}
