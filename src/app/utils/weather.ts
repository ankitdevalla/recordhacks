import { WeatherData } from '../types';

export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
  const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
  console.log('API Key available:', !!API_KEY); // Debug log
  
  if (!API_KEY) {
    throw new Error('Weather API key not found');
  }

  // Ensure API key is trimmed and properly encoded
  const trimmedKey = API_KEY.trim();
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${encodeURIComponent(trimmedKey)}&units=metric`;
  console.log('Requesting URL:', url.replace(trimmedKey, '***')); // Debug log with masked API key

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Weather API Error:', errorData); // Debug log
    throw new Error(`Failed to fetch weather data: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  return {
    temperature: Math.round(data.main.temp),
    condition: data.weather[0].main,
    location: data.name,
  };
}

export async function getUserLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
} 