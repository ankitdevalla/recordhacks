import { SpotifyRecommendation, UserMood, WeatherData, CalendarBusyness } from '../types';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

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

export async function getSpotifyRecommendations(
  mood: UserMood,
  weather: WeatherData,
  calendar: CalendarBusyness,
  accessToken: string
): Promise<SpotifyRecommendation> {
  const params = new URLSearchParams({
    limit: calculateTrackCount(mood.duration || 30).toString(), // Default to 30 minutes if not specified
    seed_genres: getMoodGenres(mood.text.split(':')[1]?.trim() || '', mood.genres),
    target_energy: getEnergyLevel(calendar.isBusy, weather.condition).toString(),
    target_valence: getMoodValence(mood.text.split(':')[1]?.trim() || '').toString(),
  });

  const response = await fetch(
    `${SPOTIFY_API_BASE}/recommendations?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Spotify recommendations');
  }

  const data = await response.json();
  return {
    tracks: data.tracks.map((track: any) => ({
      name: track.name,
      artist: track.artists[0].name,
      uri: track.uri,
    })),
  };
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