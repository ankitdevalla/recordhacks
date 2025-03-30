import {
  SpotifyRecommendation,
  UserMood,
  WeatherData,
  CalendarBusyness,
  SpotifyTrack as AppSpotifyTrack,
} from "../types";

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  uri: string;
  duration_ms: number;
  popularity: number;
}

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const SPOTIFY_AUTH_SCOPES = [
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-private",
  "user-read-email",
  "user-read-playback-state",
].join(" ");

// Store the access token in memory
let accessToken: string | null = null;
let tokenExpirationTime: number | null = null;

function generateRandomString(length: number): string {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

export function initiateSpotifyLogin() {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  if (!clientId) {
    throw new Error("Spotify client ID not configured");
  }

  const redirectUri = `${window.location.origin}/api/spotify/callback`;
  const state = generateRandomString(16);
  const scope = SPOTIFY_AUTH_SCOPES;

  // Store state in localStorage to verify the response
  localStorage.setItem("spotify_auth_state", state);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope,
    redirect_uri: redirectUri,
    state,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function handleSpotifyCallback(
  code: string,
  state: string
): Promise<void> {
  const storedState = localStorage.getItem("spotify_auth_state");
  if (state !== storedState) {
    throw new Error("State mismatch");
  }

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;
  const redirectUri = `${window.location.origin}/api/spotify/callback`;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials not configured");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get access token");
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpirationTime = Date.now() + data.expires_in * 1000;

  // Store the refresh token securely
  localStorage.setItem("spotify_refresh_token", data.refresh_token);
}

async function refreshAccessToken(): Promise<void> {
  const refreshToken = localStorage.getItem("spotify_refresh_token");
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials not configured");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh access token");
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpirationTime = Date.now() + data.expires_in * 1000;
}

export async function getValidAccessToken(): Promise<string | null> {
  if (!accessToken) {
    return null;
  }

  // Check if token is expired or will expire in the next minute
  if (tokenExpirationTime && Date.now() >= tokenExpirationTime - 60000) {
    // Token is expired or will expire soon, try to refresh it
    try {
      const refreshToken = localStorage.getItem("spotify_refresh_token");
      if (refreshToken) {
        const response = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${btoa(
              `${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET}`
            )}`,
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          accessToken = data.access_token;
          tokenExpirationTime = Date.now() + data.expires_in * 1000;
          if (data.refresh_token) {
            localStorage.setItem("spotify_refresh_token", data.refresh_token);
          }
        } else {
          // If refresh fails, clear tokens and return null
          accessToken = null;
          tokenExpirationTime = null;
          localStorage.removeItem("spotify_refresh_token");
          return null;
        }
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  }

  return accessToken;
}

function getMoodGenres(mood: string, selectedGenres?: string[]): string {
  const moodMap: { [key: string]: string } = {
    happy: "pop,dance",
    sad: "indie,acoustic",
    energetic: "rock,electronic",
    relaxed: "ambient,chill",
    focused: "classical,instrumental",
    anxious: "meditation,ambient",
    peaceful: "acoustic,folk",
    excited: "pop,rock",
    melancholic: "indie,folk",
    confident: "hip-hop,rock",
  };

  // If user has selected genres, use those instead of mood mapping
  if (selectedGenres && selectedGenres.length > 0) {
    return selectedGenres.join(",");
  }

  return moodMap[mood.toLowerCase()];
}

function getEnergyLevel(isBusy: boolean, weather: string): number {
  let energy = 0.5; // Default energy level

  if (isBusy) energy += 0.2;
  if (weather.includes("rain")) energy -= 0.2;
  if (weather.includes("sun")) energy += 0.2;

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
    confident: 0.8,
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
const moodToAudioFeatures: Record<
  string,
  { target_valence?: number; target_energy?: number }
> = {
  Happy: { target_valence: 0.8, target_energy: 0.8 },
  Sad: { target_valence: 0.2, target_energy: 0.3 },
  Energetic: { target_energy: 0.9 },
  Calm: { target_energy: 0.3, target_valence: 0.5 },
  Focused: { target_valence: 0.5, target_energy: 0.5 },
  Stressed: { target_valence: 0.3, target_energy: 0.8 },
};

// First, let's add some seed tracks for different moods
const moodSeedTracks: Record<string, string[]> = {
  Happy: ["4iV5W9uYEdYUVa79Axb7Rh", "1301WleyT98MSxVHPZCA6M"], // Pharrell - Happy, etc.
  Sad: ["4gMgiXfqyzZLMhsksGmbQV", "2dLLR6qlu5UJ5gk0dKz0h3"], // Adele - Someone Like You, etc.
  Energetic: ["7CZyCXKG6d5ALeq41sLzbw", "4Cy0NHJ8Gh0xMdwyM9RkQm"], // Survivor - Eye of the Tiger, etc.
  Calm: ["7qiZfU4dY1lWllzX7mPBI3", "0sf12qNH5qcw8qpgymFOqD"], // Ed Sheeran - Perfect, etc.
  Focused: ["5ChkMS8OtdzJeqyybCc9R5", "6O8iT490HuTFVvkT56Qct7"], // Beethoven's 5th, etc.
  Stressed: ["1BxfuPKGuaTgP7aM0Bbdwr", "3F5CgOj3wFlRv51JsHbxhe"], // Calming tracks
};

// Add this new function to get available genres
async function getAvailableGenres(token: string): Promise<string[]> {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/recommendations/available-genre-seeds`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch available genres");
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
  tempo: number;
}

// Update the transform function
function transformTrackData(track: SpotifyTrack): AppSpotifyTrack {
  return {
    name: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    uri: track.uri,
    duration_ms: track.duration_ms,
    popularity: track.popularity,
  };
}

interface SpotifyRecommendationParams {
  featureRanges: {
    valence: [number, number];
    energy: [number, number];
    tempo: [number, number];
    acousticness: [number, number];
    genres: string[];
  };
  limit?: number;
}

// Helper: Fetch audio features for a list of track IDs
async function fetchAudioFeatures(
  trackIds: string[],
  token: string
): Promise<SpotifyAudioFeatures[]> {
  const chunkSize = 50;
  let features: SpotifyAudioFeatures[] = [];
  for (let i = 0; i < trackIds.length; i += chunkSize) {
    const chunk = trackIds.slice(i, i + chunkSize);
    const params = new URLSearchParams();
    params.append("ids", chunk.join(","));
    const url = `${SPOTIFY_API_BASE}/audio-features?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const data = await response.json();
      features = features.concat(data.audio_features);
    } else {
      console.error("Failed to fetch audio features");
    }
  }
  return features;
}

// Map UI genres to Spotify's genre taxonomy
const genreMap: Record<string, string[]> = {
  Pop: ["pop", "dance-pop", "power-pop"],
  Rock: ["rock", "alternative", "hard-rock"],
  "Hip Hop": ["hip-hop", "rap", "trap"],
  Jazz: ["jazz", "jazz-funk", "bebop"],
  Classical: ["classical", "orchestra", "opera"],
  Electronic: ["electronic", "edm", "house"],
  "R&B": ["r-n-b", "soul", "funk"],
  Country: ["country", "folk", "americana"],
};

export async function getSpotifyRecommendations({
  featureRanges,
  limit = 10,
}: SpotifyRecommendationParams): Promise<SpotifyRecommendation> {
  try {
    if (!accessToken) {
      console.log("No access token found, initiating login...");
      initiateSpotifyLogin();
      throw new Error("Please log in to Spotify");
    }

    const token = await getValidAccessToken();
    if (!token) {
      throw new Error("No valid access token");
    }

    console.log("Getting tracks with feature ranges:", featureRanges);

    // Step 1: Build search query with genre filters
    const params = new URLSearchParams();
    params.append("type", "track");
    params.append("limit", "50");
    params.append("market", "US");

    // Map selected genres to Spotify's taxonomy
    const selectedGenre = featureRanges.genres[0] || "Pop";
    const spotifyGenres = genreMap[selectedGenre] || ["pop"];

    // Calculate energy level
    const avgEnergy = (featureRanges.energy[0] + featureRanges.energy[1]) / 2;

    // Build mood keywords based on energy and valence
    const avgValence =
      (featureRanges.valence[0] + featureRanges.valence[1]) / 2;
    let moodKeywords: string[] = [];

    if (avgEnergy > 0.7 && avgValence > 0.7) {
      moodKeywords = ["upbeat", "energetic"];
    } else if (avgEnergy > 0.7 && avgValence < 0.3) {
      moodKeywords = ["intense", "powerful"];
    } else if (avgEnergy < 0.3 && avgValence > 0.7) {
      moodKeywords = ["peaceful", "gentle"];
    } else if (avgEnergy < 0.3 && avgValence < 0.3) {
      moodKeywords = ["melancholic", "ambient"];
    }

    // Construct search query using genre:genre-name filter
    const genreFilters = spotifyGenres.map((g) => `genre:${g}`).join(" OR ");
    const searchQuery = `(${genreFilters}) ${moodKeywords.join(" ")}`;
    params.append("q", searchQuery);

    const url = `${SPOTIFY_API_BASE}/search?${params.toString()}`;
    console.log("Search URL:", url);

    const searchResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error("Search error:", errorText);
      throw new Error("Failed to search tracks");
    }

    const searchData: SpotifySearchResult = await searchResponse.json();
    let tracks = searchData.tracks.items;

    if (tracks.length === 0) {
      // Fallback: Try with just the first Spotify genre
      const fallbackQuery = `genre:${spotifyGenres[0]}`;
      params.set("q", fallbackQuery);
      const retryUrl = `${SPOTIFY_API_BASE}/search?${params.toString()}`;

      const retryResponse = await fetch(retryUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (retryResponse.ok) {
        const retryData: SpotifySearchResult = await retryResponse.json();
        tracks = retryData.tracks.items;
      }
    }

    console.log(`Found ${tracks.length} tracks`);

    // Sort tracks with randomization for variety
    const sortedTracks = tracks
      .sort((a: SpotifyTrack, b: SpotifyTrack) => {
        const randomFactor = Math.random() * 20 - 10;
        return b.popularity + randomFactor - (a.popularity + randomFactor);
      })
      .slice(0, limit)
      .map(transformTrackData);

    return {
      tracks: sortedTracks,
    };
  } catch (error) {
    console.error("Spotify API Error:", error);
    throw error;
  }
}

interface SpotifyPlaylistResponse {
  playlistId: string;
}

export async function createSpotifyPlaylist(
  tracks: AppSpotifyTrack[],
  name: string,
  description?: string
): Promise<SpotifyPlaylistResponse> {
  if (!accessToken) {
    console.log("No access token found, initiating login...");
    initiateSpotifyLogin();
    throw new Error("Please log in to Spotify");
  }

  const token = await getValidAccessToken();
  if (!token) {
    throw new Error("No valid access token");
  }

  try {
    // Get the current user's ID
    const userResponse = await fetch(`${SPOTIFY_API_BASE}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to get user profile");
    }

    const userData = await userResponse.json();
    const userId = userData.id;

    // Create a new playlist
    const date = new Date().toLocaleDateString();
    const playlistResponse = await fetch(
      `${SPOTIFY_API_BASE}/users/${userId}/playlists`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          description: description || `Generated on ${date}`,
          public: false,
        }),
      }
    );

    if (!playlistResponse.ok) {
      throw new Error("Failed to create playlist");
    }

    const playlist = await playlistResponse.json();
    const playlistId = playlist.id;

    // Add tracks to the playlist
    const trackUris = tracks.map((track) => track.uri);
    const addTracksResponse = await fetch(
      `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: trackUris,
        }),
      }
    );

    if (!addTracksResponse.ok) {
      throw new Error("Failed to add tracks to playlist");
    }

    return { playlistId };
  } catch (error) {
    console.error("Error creating playlist:", error);
    throw error;
  }
}

export function formatTrackList(tracks: SpotifyTrack[]): string {
  return tracks
    .map((track, index) => {
      const artists = track.artists.map((artist) => artist.name).join(", ");
      return `${index + 1}. ${track.name} - ${artists}`;
    })
    .join("\n");
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
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `Mood Music Playlist (${
          duration ? Math.floor(duration / 60) + "h" : "30m"
        })`,
        description: "Generated based on your mood and context",
        public: false,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create playlist");
  }

  const playlist = await response.json();
  return playlist.id;
}

// Add this new test function
export async function createTestPlaylist(): Promise<string> {
  try {
    if (!accessToken) {
      console.log("No access token found, initiating login...");
      initiateSpotifyLogin();
      throw new Error("Please log in to Spotify");
    }

    const token = await getValidAccessToken();
    console.log("Access token obtained:", token ? "Yes" : "No");

    // First, get the user's ID
    console.log("Fetching user profile...");
    const userResponse = await fetch(`${SPOTIFY_API_BASE}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("User profile response status:", userResponse.status);
    if (!userResponse.ok) {
      const userText = await userResponse.text();
      console.log("User profile response text:", userText);
      throw new Error("Failed to get user profile");
    }

    const userData = await userResponse.json();
    const userId = userData.id;
    console.log("User ID obtained:", userId);

    // Create a test playlist
    console.log("Creating test playlist...");
    const playlistResponse = await fetch(
      `${SPOTIFY_API_BASE}/users/${userId}/playlists`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `Test Playlist ${new Date().toLocaleTimeString()}`,
          description: "Test playlist created by WaveLength",
          public: false,
        }),
      }
    );

    console.log("Playlist creation response status:", playlistResponse.status);
    if (!playlistResponse.ok) {
      const playlistText = await playlistResponse.text();
      console.log("Playlist creation response text:", playlistText);
      throw new Error("Failed to create playlist");
    }

    const playlist = await playlistResponse.json();
    console.log("Playlist created with ID:", playlist.id);

    // Add a test track (Spotify URI for "Shape of You" by Ed Sheeran)
    const testTrackUri = "spotify:track:7qiZfU4dY1lWllzX7mPBI3";
    console.log("Adding test track to playlist...");

    const addTracksResponse = await fetch(
      `${SPOTIFY_API_BASE}/playlists/${playlist.id}/tracks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [testTrackUri],
        }),
      }
    );

    console.log("Add tracks response status:", addTracksResponse.status);
    if (!addTracksResponse.ok) {
      const addTracksText = await addTracksResponse.text();
      console.log("Add tracks response text:", addTracksText);
      throw new Error("Failed to add tracks to playlist");
    }

    console.log("Successfully created test playlist with one track");
    return playlist.id;
  } catch (error) {
    console.error("Error in createTestPlaylist:", error);
    throw error;
  }
}
