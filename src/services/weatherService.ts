export async function getWeatherData(lat: number, lon: number) {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || localStorage.getItem('WEATHER_API_KEY_FALLBACK');
  
  if (!apiKey || apiKey === "") {
    console.warn("OpenWeather API key missing. Using simulated data.");
    return null;
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || response.statusText;
      
      if (response.status === 401) {
        throw new Error("Invalid API Key. Please check your OpenWeatherMap key.");
      } else if (response.status === 429) {
        throw new Error("Rate limit exceeded. Try again later.");
      }
      
      throw new Error(`Weather API Error: ${message}`);
    }

    const data = await response.json();
    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const e = (humidity / 100) * 6.105 * Math.exp((17.27 * temp) / (237.7 + temp));
    const wbgt = 0.567 * temp + 0.393 * e + 3.94;
    return {
      temp: temp,
      humidity: humidity,
      description: data.weather[0].description,
      windSpeed: data.wind.speed,
      wbgt:wbgt
    };
  } catch (error) {
    console.error("Error fetching real-time weather:", error);
    return null;
  }
}
