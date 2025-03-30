'use client';

import { useEffect, useState } from 'react';
import { SpotifyRecommendation, UserMood, WeatherData, CalendarBusyness } from '../types';
import { getSpotifyRecommendations, createSpotifyPlaylist, initiateSpotifyLogin } from '../utils/spotify';
import { getMoodFeatureRanges } from '../utils/openai';

interface PlaylistRecommendationProps {
  mood: UserMood | null;
  weather: WeatherData | null;
  calendar: CalendarBusyness | null;
}

export default function PlaylistRecommendation({
  mood,
  weather,
  calendar
}: PlaylistRecommendationProps) {
  const [recommendation, setRecommendation] = useState<SpotifyRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mood) return;

    const generatePlaylist = async () => {
      setLoading(true);
      setError(null);
      try {
        // First, get feature ranges from GPT based on context
        const featureRanges = await getMoodFeatureRanges({
          mood: mood.text,
          weather: weather ? {
            temperature: weather.temperature,
            condition: weather.condition
          } : undefined,
          calendar: calendar ? {
            isBusy: calendar.isBusy,
            eventCount: calendar.eventCount
          } : undefined,
          selectedGenres: mood.genres
        });

        // Then get recommendations from Spotify using those ranges
        const result = await getSpotifyRecommendations({
          featureRanges
        });
        
        setRecommendation(result);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
          if (err.message === 'Please log in to Spotify') {
            // Handle login redirect
            return;
          }
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    generatePlaylist();
  }, [mood, weather, calendar]);

  const handleCreatePlaylist = async () => {
    if (!recommendation?.tracks.length) return;

    setLoading(true);
    setError(null);
    try {
      const result = await createSpotifyPlaylist(recommendation.tracks, mood?.text || 'Custom Playlist');
      setRecommendation(prev => prev ? { ...prev, playlistId: result.playlistId } : null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        if (err.message === 'Please log in to Spotify') {
          initiateSpotifyLogin();
          return;
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  if (!recommendation?.tracks.length) {
    return null;
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-900">
        Your Personalized Playlist
      </h2>
      
      <div className="space-y-4">
        {recommendation.tracks.map((track, index) => (
          <div key={track.uri} className="flex items-center space-x-4 p-4 bg-white/60 rounded-lg">
            <span className="text-gray-500">{index + 1}</span>
            <div>
              <p className="font-medium text-gray-900">{track.name}</p>
              <p className="text-sm text-gray-600">{track.artist}</p>
            </div>
          </div>
        ))}
      </div>

      {!recommendation.playlistId && (
        <button
          onClick={handleCreatePlaylist}
          className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save to Spotify
        </button>
      )}

      {recommendation.playlistId && (
        <a
          href={`https://open.spotify.com/playlist/${recommendation.playlistId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Open in Spotify
        </a>
      )}
    </div>
  );
} 