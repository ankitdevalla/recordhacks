'use client';

import { useEffect, useState } from 'react';
import { SpotifyRecommendation, UserMood, WeatherData, CalendarBusyness } from '../types';
import { getSpotifyRecommendations, createSpotifyPlaylist, initiateSpotifyLogin } from '../utils/spotify';

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
  const [playlistId, setPlaylistId] = useState<string | null>(null);

  useEffect(() => {
    async function generatePlaylist() {
      if (!mood) return;

      setLoading(true);
      setError(null);

      try {
        const recommendation = await getSpotifyRecommendations(
          mood.text,
          mood.genres,
          mood.duration || 30
        );
        setRecommendation(recommendation);
      } catch (err) {
        if (err instanceof Error && err.message.includes('Not authenticated')) {
          setError('Please log in to Spotify to get recommendations');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to generate playlist');
        }
      } finally {
        setLoading(false);
      }
    }

    generatePlaylist();
  }, [mood]);

  const handleCreatePlaylist = async () => {
    if (!recommendation || !mood) return;

    try {
      setLoading(true);
      const id = await createSpotifyPlaylist(
        recommendation.tracks,
        mood.text,
        mood.duration || 30
      );
      setPlaylistId(id);
    } catch (err) {
      if (err instanceof Error && err.message.includes('Not authenticated')) {
        initiateSpotifyLogin();
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create playlist');
      }
    } finally {
      setLoading(false);
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
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        {error.includes('Please log in') && (
          <button
            onClick={initiateSpotifyLogin}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Log in to Spotify
          </button>
        )}
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
                <p className="text-sm text-gray-600">
                  {track.artist}
                </p>
              </div>
            </li>
          ))}
        </ul>
        {playlistId ? (
          <div className="text-center">
            <p className="text-green-600 mb-2">Playlist created successfully!</p>
            <a
              href={`https://open.spotify.com/playlist/${playlistId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Open in Spotify
            </a>
          </div>
        ) : (
          <button
            onClick={handleCreatePlaylist}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
          >
            Create Playlist on Spotify
          </button>
        )}
      </div>
    </div>
  );
} 