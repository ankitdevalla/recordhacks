'use client';

import { useEffect, useState } from 'react';
import { WeatherData } from '../types';
import { getCurrentWeather, getUserLocation } from '../utils/weather';

export default function WeatherDisplay() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const location = await getUserLocation();
        const weatherData = await getCurrentWeather(location.lat, location.lon);
        setWeather(weatherData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weather');
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Weather</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Location</p>
          <p className="text-lg font-medium text-gray-900">{weather.location}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Temperature</p>
          <p className="text-lg font-medium text-gray-900">{weather.temperature}°C</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 col-span-2">
          <p className="text-sm text-gray-600 mb-1">Condition</p>
          <p className="text-lg font-medium text-gray-900">{weather.condition}</p>
        </div>
      </div>
    </div>
  );
} 