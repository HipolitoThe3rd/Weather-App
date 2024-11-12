const apiKey = '996d40740a99706dd2089233ac6a880b';
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const weatherInfo = document.getElementById('weatherInfo');

searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        fetchWeather(city);
    }
});

locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(positionSuccess, positionError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

function positionSuccess(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    fetchWeatherByCoords(lat, lon);
}

function positionError() {
    alert("Unable to retrieve your location. Please enter a city manually.");
}

async function fetchWeatherByCoords(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        const currentWeather = data.list[0];
        const dailyForecasts = getDailyForecasts(data.list);
        
        displayWeather(data.city.name, currentWeather, dailyForecasts);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        weatherInfo.innerHTML = '<p>An error occurred. Please try again later.</p>';
    }
}

// Update the existing fetchWeather function to use the city name
async function fetchWeather(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        const currentWeather = data.list[0];
        const dailyForecasts = getDailyForecasts(data.list);
        
        displayWeather(city, currentWeather, dailyForecasts);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        weatherInfo.innerHTML = '<p>An error occurred. Please try again later.</p>';
    }
}

function getDailyForecasts(forecastList) {
    const dailyForecasts = [];
    const today = new Date().getDate();
    
    for (const forecast of forecastList) {
        const forecastDate = new Date(forecast.dt * 1000);
        if (forecastDate.getDate() !== today && dailyForecasts.length < 5) {
            if (!dailyForecasts.some(f => new Date(f.dt * 1000).getDate() === forecastDate.getDate())) {
                dailyForecasts.push(forecast);
            }
        }
    }
    
    return dailyForecasts;
}

function displayWeather(city, currentWeather, dailyForecasts) {
    const temperature = currentWeather.main.temp;
    const description = currentWeather.weather[0].description;
    const iconCode = currentWeather.weather[0].icon; // Get the icon code
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`; // Construct the icon URL
    
    let forecastHTML = `
        <h2>${city}</h2>
        <p>Current Temperature: ${temperature}°C</p>
        <p>Description: ${description}</p>
        <img src="${iconUrl}" alt="${description}" class="weather-icon"> <!-- Add icon here -->
        <h3>5-Day Forecast:</h3>
        <div class="forecast-container">
    `;
    
    for (const forecast of dailyForecasts) {
        const date = new Date(forecast.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const temp = forecast.main.temp;
        const desc = forecast.weather[0].description;
        const iconCode = forecast.weather[0].icon; // Get the icon code for daily forecast
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`; // Construct the icon URL
        
        forecastHTML += `
            <div class="forecast-day">
                <p>${date}</p>
                <p>${temp}°C</p>
                <p>${desc}</p>
                <img src="${iconUrl}" alt="${desc}" class="forecast-icon"> <!-- Add daily forecast icon here -->
            </div>
        `;
    }
    
    forecastHTML += '</div>';
    weatherInfo.innerHTML = forecastHTML;
}