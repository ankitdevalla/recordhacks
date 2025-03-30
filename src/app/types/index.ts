export interface UserMood {
  text: string;
  timestamp: Date;
  genres?: string[];
  duration?: number; // Duration in minutes
}

export interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
}

export interface CalendarBusyness {
  eventCount: number;
  nextEvent: Date;
  isBusy: boolean;
}

export interface SpotifyRecommendation {
  tracks: Array<{
    name: string;
    artist: string;
    uri: string;
  }>;
  playlistId?: string;
}

export interface SpotifyTrack {
  name: string;
  artist: string;
  uri: string;
  duration_ms: number;
  popularity: number;
} 