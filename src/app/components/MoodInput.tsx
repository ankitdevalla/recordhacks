'use client';

import { useState, useEffect } from 'react';
import { UserMood } from '../types';

interface MoodInputProps {
  onMoodSubmit: (mood: UserMood) => void;
  onMoodChange: (mood: string) => void;
  onGenresChange: (genres: string[]) => void;
}

export default function MoodInput({ onMoodSubmit, onMoodChange, onGenresChange }: MoodInputProps) {
  const [mood, setMood] = useState('');
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    onMoodChange(mood);
  }, [mood, onMoodChange]);

  useEffect(() => {
    onGenresChange(genres);
  }, [genres, onGenresChange]);

  const handleGenreToggle = (genre: string) => {
    setGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood) return;
    
    onMoodSubmit({
      text: mood,
      genres,
      timestamp: new Date(),
      duration: 30
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">How are you feeling?</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select your mood
          </label>
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="mt-1 block w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-base text-gray-900 bg-white p-3"
            required
          >
            <option value="">Choose a mood...</option>
            <option value="Happy">Happy</option>
            <option value="Sad">Sad</option>
            <option value="Energetic">Energetic</option>
            <option value="Calm">Calm</option>
            <option value="Anxious">Anxious</option>
            <option value="Focused">Focused</option>
            <option value="Romantic">Romantic</option>
            <option value="Nostalgic">Nostalgic</option>
            <option value="Melancholic">Melancholic</option>
            <option value="Excited">Excited</option>
            <option value="Peaceful">Peaceful</option>
            <option value="Stressed">Stressed</option>
            <option value="Playful">Playful</option>
            <option value="Reflective">Reflective</option>
            <option value="Motivated">Motivated</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select your preferred genres
          </label>
          <div className="grid grid-cols-2 gap-3">
            {['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country'].map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => handleGenreToggle(genre)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  genres.includes(genre)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
} 