'use client';

import { useEffect, useState } from 'react';
import { SpotifyRecommendation, UserMood, WeatherData, CalendarBusyness } from '../types';
import { getSpotifyRecommendations, createPlaylist } from '../utils/spotify';

interface PlaylistRecommendationProps {
  mood: UserMood | null;
  weather: WeatherData | null;
  calendar: CalendarBusyness | null;
}

export default function PlaylistRecommendation({
  mood,
  weather,
  calendar,
}: PlaylistRecommendationProps) {
  const [recommendation, setRecommendation] = useState<SpotifyRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function generatePlaylist() {
      if (!mood || !weather || !calendar) return;

      setLoading(true);
      setError(null);

      try {
        // TODO: Implement proper Spotify authentication
        const mockAccessToken = 'mock_token';
        const recommendation = await getSpotifyRecommendations(
          mood,
          weather,
          calendar,
          mockAccessToken
        );
        setRecommendation(recommendation);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate playlist');
      } finally {
        setLoading(false);
      }
    }

    generatePlaylist();
  }, [mood, weather, calendar]);

  const handleCreatePlaylist = async () => {
    if (!recommendation) return;

    try {
      // TODO: Implement proper Spotify authentication
      const mockAccessToken = 'mock_token';
      const mockUserId = 'mock_user_id';
      const playlistId = await createPlaylist(
        recommendation.tracks.map(track => ({ uri: track.uri })),
        mockAccessToken,
        mockUserId
      );
      console.log('Playlist created:', playlistId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create playlist');
    }
  };

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

  if (!recommendation) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Recommended Playlist</h2>
      <div className="space-y-4">
        <ul className="space-y-3">
          {recommendation.tracks.map((track, index) => (
            <li key={index} className="bg-gray-50 rounded-lg p-4">
              <div>
                <p className="font-medium text-gray-900">{track.name}</p>
                <p className="text-sm text-gray-600">{track.artist}</p>
              </div>
            </li>
          ))}
        </ul>
        <button
          onClick={handleCreatePlaylist}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          Create Playlist on Spotify
        </button>
      </div>
    </div>
  );
} 