import { SpotifyRecommendation, UserMood, WeatherData, CalendarBusyness, SpotifyTrack as AppSpotifyTrack } from '../types';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  uri: string;
  duration_ms: number;
  popularity: number;
}

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_AUTH_SCOPES = [
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-private',
  'user-read-email',
  'user-read-playback-state'
].join(' ');

// Store the access token in memory
let accessToken: string | null = null;
let tokenExpirationTime: number | null = null;

function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

export function initiateSpotifyLogin() {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  if (!clientId) {
    throw new Error('Spotify client ID not configured');
  }

  const redirectUri = `${window.location.origin}/api/spotify/callback`;
  const state = generateRandomString(16);
  const scope = SPOTIFY_AUTH_SCOPES;

  // Store state in localStorage to verify the response
  localStorage.setItem('spotify_auth_state', state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope,
    redirect_uri: redirectUri,
    state,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function handleSpotifyCallback(code: string, state: string): Promise<void> {
  const storedState = localStorage.getItem('spotify_auth_state');
  if (state !== storedState) {
    throw new Error('State mismatch');
  }

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;
  const redirectUri = `${window.location.origin}/api/spotify/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    },
    body: new URLSearchParams({
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })
  });

  if (!response.ok) {
    throw new Error('Failed to get access token');
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpirationTime = Date.now() + (data.expires_in * 1000);

  // Store the refresh token securely
  localStorage.setItem('spotify_refresh_token', data.refresh_token);
}

async function refreshAccessToken(): Promise<void> {
  const refreshToken = localStorage.getItem('spotify_refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpirationTime = Date.now() + (data.expires_in * 1000);
}

export async function getValidAccessToken(): Promise<string | null> {
  if (!accessToken) {
    return null;
  }

  // Check if token is expired or will expire in the next minute
  if (tokenExpirationTime && Date.now() >= tokenExpirationTime - 60000) {
    // Token is expired or will expire soon, try to refresh it
    try {
      const refreshToken = localStorage.getItem('spotify_refresh_token');
      if (refreshToken) {
        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET}`)}`
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken
          })
        });

        if (response.ok) {
          const data = await response.json();
          accessToken = data.access_token;
          tokenExpirationTime = Date.now() + data.expires_in * 1000;
          if (data.refresh_token) {
            localStorage.setItem('spotify_refresh_token', data.refresh_token);
          }
        } else {
          // If refresh fails, clear tokens and return null
          accessToken = null;
          tokenExpirationTime = null;
          localStorage.removeItem('spotify_refresh_token');
          return null;
        }
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  return accessToken;
}

function getMoodGenres(mood: string, selectedGenres?: string[]): string {
  const moodMap: { [key: string]: string } = {
    happy: 'pop,dance',
    sad: 'indie,acoustic',
    energetic: 'rock,electronic',
    relaxed: 'ambient,chill',
    focused: 'classical,instrumental',
    anxious: 'meditation,ambient',
    peaceful: 'acoustic,folk',
    excited: 'pop,rock',
    melancholic: 'indie,folk',
    confident: 'hip-hop,rock'
  };

  // If user has selected genres, use those instead of mood mapping
  if (selectedGenres && selectedGenres.length > 0) {
    return selectedGenres.join(',');
  }

  return moodMap[mood.toLowerCase()] || 'pop';
}

function getEnergyLevel(isBusy: boolean, weather: string): number {
  let energy = 0.5; // Default energy level

  if (isBusy) energy += 0.2;
  if (weather.includes('rain')) energy -= 0.2;
  if (weather.includes('sun')) energy += 0.2;

  return Math.min(Math.max(energy, 0), 1); // Clamp between 0 and 1
}

function getMoodValence(mood: string): number {
  const valenceMap: { [key: string]: number } = {
    happy: 0.8,
    sad: 0.2,
    energetic: 0.7,
    relaxed: 0.6,
    focused: 0.5,
    anxious: 0.3,
    peaceful: 0.7,
    excited: 0.8,
    melancholic: 0.3,
    confident: 0.8
  };

  return valenceMap[mood.toLowerCase()] || 0.5;
}

// Calculate number of tracks based on duration
function calculateTrackCount(duration: number): number {
  // Assuming average track length of 3.5 minutes
  const averageTrackLength = 3.5;
  return Math.ceil(duration / averageTrackLength);
}

// Map moods to Spotify audio features
const moodToAudioFeatures: Record<string, { target_valence?: number; target_energy?: number }> = {
  'Happy': { target_valence: 0.8, target_energy: 0.8 },
  'Sad': { target_valence: 0.2, target_energy: 0.3 },
  'Energetic': { target_energy: 0.9 },
  'Calm': { target_energy: 0.3, target_valence: 0.5 },
  'Focused': { target_valence: 0.5, target_energy: 0.5 },
  'Stressed': { target_valence: 0.3, target_energy: 0.8 }
};

// First, let's add some seed tracks for different moods
const moodSeedTracks: Record<string, string[]> = {
  'Happy': ['4iV5W9uYEdYUVa79Axb7Rh', '1301WleyT98MSxVHPZCA6M'], // Pharrell - Happy, etc.
  'Sad': ['4gMgiXfqyzZLMhsksGmbQV', '2dLLR6qlu5UJ5gk0dKz0h3'], // Adele - Someone Like You, etc.
  'Energetic': ['7CZyCXKG6d5ALeq41sLzbw', '4Cy0NHJ8Gh0xMdwyM9RkQm'], // Survivor - Eye of the Tiger, etc.
  'Calm': ['7qiZfU4dY1lWllzX7mPBI3', '0sf12qNH5qcw8qpgymFOqD'], // Ed Sheeran - Perfect, etc.
  'Focused': ['5ChkMS8OtdzJeqyybCc9R5', '6O8iT490HuTFVvkT56Qct7'], // Beethoven's 5th, etc.
  'Stressed': ['1BxfuPKGuaTgP7aM0Bbdwr', '3F5CgOj3wFlRv51JsHbxhe'] // Calming tracks
};

// Add this new function to get available genres
async function getAvailableGenres(token: string): Promise<string[]> {
  const response = await fetch(`${SPOTIFY_API_BASE}/recommendations/available-genre-seeds`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch available genres');
  }

  const data = await response.json();
  return data.genres;
}

// Add these new interfaces
interface SpotifySearchResult {
  tracks: {
    items: SpotifyTrack[];
    next: string | null;
  };
}

interface SpotifyAudioFeatures {
  id: string;
  energy: number;
  valence: number;
  danceability: number;
  acousticness: number;
  speechiness: number;
}

// Update the transform function
function transformTrackData(track: SpotifyTrack): AppSpotifyTrack {
  return {
    name: track.name,
    artist: track.artists.map(a => a.name).join(', '),
    uri: track.uri,
    duration_ms: track.duration_ms,
    popularity: track.popularity
  };
}

export async function getSpotifyRecommendations(mood: string, genres: string[], duration: number = 30): Promise<SpotifyRecommendation> {
  try {
    if (!accessToken) {
      console.log('No access token found, initiating login...');
      initiateSpotifyLogin();
      throw new Error('Please log in to Spotify');
    }

    const token = await getValidAccessToken();
    if (!token) {
      throw new Error('No valid access token');
    }

    console.log('Getting tracks for:', { mood, genres, duration });

    // Search for tracks from each genre and combine results
    let allTracks: SpotifyTrack[] = [];
    const tracksPerGenre = Math.ceil(50 / genres.length); // Distribute our 50-track limit across genres

    for (const genre of genres) {
      console.log(`Searching for genre: ${genre}`);
      const searchQuery = `genre:${genre.toLowerCase()}`;
      
      const searchResponse = await fetch(
        `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=${tracksPerGenre}&market=US`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!searchResponse.ok) {
        console.error(`Search error for genre ${genre}:`, await searchResponse.text());
        continue; // Skip this genre if search fails, but continue with others
      }

      const searchData: SpotifySearchResult = await searchResponse.json();
      allTracks = [...allTracks, ...searchData.tracks.items];
    }

    // Remove duplicates (in case some tracks appear in multiple genres)
    allTracks = allTracks.filter((track, index, self) =>
      index === self.findIndex((t) => t.id === track.id)
    );

    console.log(`Found ${allTracks.length} unique tracks from all genres`);

    try {
      // Get audio features for all tracks
      const trackIds = allTracks.map(track => track.id).join(',');
      const featuresResponse = await fetch(
        `${SPOTIFY_API_BASE}/audio-features?ids=${trackIds}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (featuresResponse.ok) {
        const featuresData = await featuresResponse.json();
        const audioFeatures: SpotifyAudioFeatures[] = featuresData.audio_features;

        // Score tracks based on audio features and mood
        allTracks = allTracks
          .map((track, index) => {
            const features = audioFeatures[index];
            if (!features) return { track, score: track.popularity / 100 };

            let score = track.popularity / 100; // Base score on popularity (0-1)
            
            // Add mood-based scoring
            switch(mood.toLowerCase()) {
              case 'happy':
              case 'energetic':
                score += features.energy * 0.4;      // High energy
                score += features.valence * 0.4;     // High positivity
                score += features.danceability * 0.2; // Somewhat danceable
                break;
              case 'calm':
              case 'relaxed':
                score += (1 - features.energy) * 0.4;    // Low energy
                score += (features.valence * 0.5) * 0.4; // Moderate positivity
                score += (1 - features.danceability) * 0.2; // Less danceable
                break;
              case 'sad':
              case 'melancholic':
                score += (1 - features.valence) * 0.4;   // Low positivity
                score += (1 - features.energy) * 0.4;    // Low energy
                score += features.acousticness * 0.2;    // Prefer acoustic
                break;
              case 'focused':
              case 'productive':
                score += (features.energy * 0.7) * 0.4;  // Moderate energy
                score += (1 - features.danceability) * 0.4; // Less danceable
                score += (1 - features.speechiness) * 0.2;  // Less lyrics
                break;
              default:
                // For unknown moods, just use popularity and energy as baseline
                score += features.energy * 0.5;
            }

            return { track, score };
          })
          .sort((a, b) => b.score - a.score)
          .map(item => item.track);
      } else {
        console.log('Could not get audio features, falling back to popularity-based selection');
        // If we can't get audio features, sort by popularity and randomize a bit
        allTracks = allTracks
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, Math.min(20, allTracks.length)) // Take top 20 by popularity
          .sort(() => Math.random() - 0.5); // Shuffle them
      }
    } catch (error) {
      console.error('Error getting audio features:', error);
      // Fallback to popularity-based sorting with some randomization
      allTracks = allTracks
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, Math.min(20, allTracks.length))
        .sort(() => Math.random() - 0.5);
    }

    // Take top 10 tracks
    const selectedTracks = allTracks
      .slice(0, 10)
      .map(track => transformTrackData(track));

    console.log(`Selected ${selectedTracks.length} tracks based on available criteria`);

    return {
      tracks: selectedTracks
    };
  } catch (error) {
    console.error('Spotify API Error:', error);
    throw error;
  }
}

export async function createSpotifyPlaylist(tracks: AppSpotifyTrack[], mood: string, duration: number): Promise<string> {
  if (!accessToken) {
    throw new Error('Not authenticated with Spotify');
  }

  const token = await getValidAccessToken();
  if (!token) {
    throw new Error('No valid access token');
  }

  try {
    // First, get the user's ID
    const userResponse = await fetch(`${SPOTIFY_API_BASE}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user profile');
    }

    const userData = await userResponse.json();
    const userId = userData.id;

    // Create a new playlist
    const playlistResponse = await fetch(`${SPOTIFY_API_BASE}/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `${mood} Mood - ${duration} Minutes`,
        description: `Generated by Mood Music - ${new Date().toLocaleDateString()}`,
        public: false
      })
    });

    if (!playlistResponse.ok) {
      throw new Error('Failed to create playlist');
    }

    const playlist = await playlistResponse.json();

    // Add tracks to the playlist
    const trackUris = tracks.map(track => track.uri);
    const addTracksResponse = await fetch(`${SPOTIFY_API_BASE}/playlists/${playlist.id}/tracks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uris: trackUris
      })
    });

    if (!addTracksResponse.ok) {
      throw new Error('Failed to add tracks to playlist');
    }

    return playlist.id;
  } catch (error) {
    console.error('Error creating playlist:', error);
    throw error;
  }
}

export function formatTrackList(tracks: SpotifyTrack[]): string {
  return tracks
    .map((track, index) => {
      const artists = track.artists.map(artist => artist.name).join(', ');
      return `${index + 1}. ${track.name} - ${artists}`;
    })
    .join('\n');
}

export async function createPlaylist(
  tracks: Array<{ uri: string }>,
  accessToken: string,
  userId: string,
  duration?: number
): Promise<string> {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/users/${userId}/playlists`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `Mood Music Playlist (${duration ? Math.floor(duration / 60) + 'h' : '30m'})`,
        description: 'Generated based on your mood and context',
        public: false,
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to create playlist');
  }

  const playlist = await response.json();
  return playlist.id;
}

// Add this new test function
export async function createTestPlaylist(): Promise<string> {
  try {
    if (!accessToken) {
      console.log('No access token found, initiating login...');
      initiateSpotifyLogin();
      throw new Error('Please log in to Spotify');
    }

    const token = await getValidAccessToken();
    console.log('Access token obtained:', token ? 'Yes' : 'No');

    // First, get the user's ID
    console.log('Fetching user profile...');
    const userResponse = await fetch(`${SPOTIFY_API_BASE}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('User profile response status:', userResponse.status);
    if (!userResponse.ok) {
      const userText = await userResponse.text();
      console.log('User profile response text:', userText);
      throw new Error('Failed to get user profile');
    }

    const userData = await userResponse.json();
    const userId = userData.id;
    console.log('User ID obtained:', userId);

    // Create a test playlist
    console.log('Creating test playlist...');
    const playlistResponse = await fetch(`${SPOTIFY_API_BASE}/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `Test Playlist ${new Date().toLocaleTimeString()}`,
        description: 'Test playlist created by Mood Music',
        public: false
      })
    });

    console.log('Playlist creation response status:', playlistResponse.status);
    if (!playlistResponse.ok) {
      const playlistText = await playlistResponse.text();
      console.log('Playlist creation response text:', playlistText);
      throw new Error('Failed to create playlist');
    }

    const playlist = await playlistResponse.json();
    console.log('Playlist created with ID:', playlist.id);

    // Add a test track (Spotify URI for "Shape of You" by Ed Sheeran)
    const testTrackUri = 'spotify:track:7qiZfU4dY1lWllzX7mPBI3';
    console.log('Adding test track to playlist...');
    
    const addTracksResponse = await fetch(`${SPOTIFY_API_BASE}/playlists/${playlist.id}/tracks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uris: [testTrackUri]
      })
    });

    console.log('Add tracks response status:', addTracksResponse.status);
    if (!addTracksResponse.ok) {
      const addTracksText = await addTracksResponse.text();
      console.log('Add tracks response text:', addTracksText);
      throw new Error('Failed to add tracks to playlist');
    }

    console.log('Successfully created test playlist with one track');
    return playlist.id;
  } catch (error) {
    console.error('Error in createTestPlaylist:', error);
    throw error;
  }
} 