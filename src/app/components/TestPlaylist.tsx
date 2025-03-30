import { useState } from 'react';
import { getValidAccessToken } from '../utils/spotify';

export default function TestPlaylist() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const createTestPlaylist = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Get the access token from our spotify utils
      const token = await getValidAccessToken();
      if (!token) {
        throw new Error('No access token available. Please log in to Spotify first.');
      }

      // Make the request to our API endpoint
      const response = await fetch('/api/spotify/playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create playlist');
      }

      setSuccess(`Playlist created successfully! ID: ${data.playlistId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={createTestPlaylist}
        disabled={loading}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Test Playlist'}
      </button>

      {error && (
        <div className="mt-4 text-red-500">
          Error: {error}
        </div>
      )}

      {success && (
        <div className="mt-4 text-green-500">
          {success}
        </div>
      )}
    </div>
  );
} 