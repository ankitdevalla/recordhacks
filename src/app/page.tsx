'use client';

import { useState } from 'react';
import MoodInput from './components/MoodInput';
import WeatherDisplay from './components/WeatherDisplay';
import CalendarStatus from './components/CalendarStatus';
import PlaylistRecommendation from './components/PlaylistRecommendation';
import TestPlaylist from './components/TestPlaylist';
import AnimatedBackground from './components/AnimatedBackground';
import { UserMood, WeatherData, CalendarBusyness } from './types';
import { getMoodStyle } from './utils/moodStyles';

export default function Home() {
  const [moodData, setMoodData] = useState<UserMood | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarBusyness | null>(null);
  const [duration, setDuration] = useState(30);
  const [comments, setComments] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const currentMoodStyle = getMoodStyle(selectedMood);

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} minutes`;
  };

  const handleMoodSubmit = (mood: UserMood) => {
    setMoodData({
      ...mood,
      duration,
      text: comments ? `${mood.text} - ${comments}` : mood.text
    });
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = Number(e.target.value);
    setDuration(newDuration);
    if (moodData) {
      setMoodData(prev => prev ? {...prev, duration: newDuration} : null);
    }
  };

  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newComments = e.target.value;
    setComments(newComments);
    if (moodData) {
      const baseMood = moodData.text.split('-')[0];
      setMoodData(prev => prev ? {...prev, text: newComments ? `${baseMood} - ${newComments}` : baseMood} : null);
    }
  };

  const handleSubmit = () => {
    if (!selectedMood) return;
    
    handleMoodSubmit({
      text: selectedMood,
      genres: selectedGenres,
      timestamp: new Date(),
      duration
    });
  };

  return (
    <>
      <AnimatedBackground mood={selectedMood} />
      <main className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500 ${currentMoodStyle.gradient}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className={`text-4xl font-bold mb-4 ${currentMoodStyle.textColor}`}>
              Mood Music Generator
            </h1>
          </div>

          {/* Top Row - Mood and Weather */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Mood Input */}
            <div>
              <MoodInput 
                onMoodSubmit={handleMoodSubmit}
                onMoodChange={setSelectedMood}
                onGenresChange={setSelectedGenres}
              />
            </div>

            {/* Weather Display */}
            <div>
              <WeatherDisplay />
            </div>
          </div>

          {/* Bottom Row - Duration and Calendar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Duration and Comments */}
            <div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 space-y-6">
                <div>
                  <label className={`block text-lg font-semibold mb-2 ${currentMoodStyle.textColor}`}>
                    Playlist Duration: {formatDuration(duration)}
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="180"
                    step="15"
                    value={duration}
                    onChange={handleDurationChange}
                    className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${currentMoodStyle.accentColor}`}
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>30 min</span>
                    <span>3 hours</span>
                  </div>
                </div>

                <div>
                  <label className={`block text-lg font-semibold mb-2 ${currentMoodStyle.textColor}`}>
                    Additional Comments
                  </label>
                  <textarea
                    value={comments}
                    onChange={handleCommentsChange}
                    className="mt-1 block w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-base text-gray-900 bg-white/90 p-3"
                    rows={4}
                    placeholder="Tell us more about how you're feeling..."
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!selectedMood}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white ${currentMoodStyle.accentColor} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Generate Playlist
                </button>
              </div>
            </div>

            {/* Calendar Status */}
            <div>
              <CalendarStatus />
            </div>
          </div>

          {/* Playlist Recommendation - Full Width */}
          <div className="mt-12">
            <PlaylistRecommendation
              mood={moodData}
              weather={weatherData}
              calendar={calendarData}
            />
          </div>
        </div>
      </main>
    </>
  );
}
