export interface MoodFeatureRanges {
  valence: [number, number];
  energy: [number, number];
  tempo: [number, number];
  acousticness: [number, number];
  genres: string[];
}

export interface MoodContext {
  mood: string;
  weather?: {
    temperature: number;
    condition: string;
  };
  calendar?: {
    isBusy: boolean;
    eventCount: number;
  };
  selectedGenres: string[];
  comments?: string;
}

export async function getMoodFeatureRanges(context: MoodContext): Promise<MoodFeatureRanges> {
  try {
    const response = await fetch('/api/mood-features', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(context),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to get mood features');
    }

    const features = await response.json() as MoodFeatureRanges;
    
    // Validate the ranges
    if (!isValidFeatureRanges(features)) {
      throw new Error('Invalid feature ranges returned from API');
    }

    return features;
  } catch (error) {
    console.error('Error getting mood features:', error);
    // Return default ranges if there's an error, but keep user's genre selection
    return {
      valence: [0.4, 0.6],
      energy: [0.4, 0.6],
      tempo: [90, 130],
      acousticness: [0.3, 0.7],
      genres: context.selectedGenres.length > 0 ? context.selectedGenres : ['pop']
    };
  }
}

function isValidFeatureRanges(features: any): features is MoodFeatureRanges {
  return (
    typeof features === 'object' &&
    Array.isArray(features.valence) && features.valence.length === 2 &&
    features.valence.every((v: number) => v >= 0 && v <= 1) &&
    Array.isArray(features.energy) && features.energy.length === 2 &&
    features.energy.every((v: number) => v >= 0 && v <= 1) &&
    Array.isArray(features.tempo) && features.tempo.length === 2 &&
    features.tempo.every((v: number) => v >= 60 && v <= 200) &&
    Array.isArray(features.acousticness) && features.acousticness.length === 2 &&
    features.acousticness.every((v: number) => v >= 0 && v <= 1) &&
    Array.isArray(features.genres) &&
    features.genres.every((g: any) => typeof g === 'string')
  );
} 