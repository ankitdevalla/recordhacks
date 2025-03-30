import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export async function POST() {
  try {
    // Get the access token from the request headers
    const headersList = headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization) {
      return NextResponse.json(
        { success: false, error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    // First get the user's profile to get their user ID
    const profileResponse = await fetch(`${SPOTIFY_API_BASE}/me`, {
      headers: {
        'Authorization': authorization
      }
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('Profile fetch error:', errorText);
      throw new Error(`Failed to get user profile: ${profileResponse.status}`);
    }

    const profile = await profileResponse.json();
    const userId = profile.id;
    console.log('User ID obtained:', userId);

    // Create a test playlist for the authenticated user
    const testTrackUri = 'spotify:track:7qiZfU4dY1lWllzX7mPBI3'; // Shape of You by Ed Sheeran

    // Create the playlist
    const createPlaylistResponse = await fetch(`${SPOTIFY_API_BASE}/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `Test Playlist ${new Date().toLocaleTimeString()}`,
        description: 'Test playlist created by Mood Music',
        public: false
      })
    });

    console.log('Playlist creation response status:', createPlaylistResponse.status);
    
    if (!createPlaylistResponse.ok) {
      const errorText = await createPlaylistResponse.text();
      console.error('Playlist creation error:', errorText);
      throw new Error(`Failed to create playlist: ${createPlaylistResponse.status}`);
    }

    const playlist = await createPlaylistResponse.json();
    console.log('Playlist created with ID:', playlist.id);

    // Add the test track to the playlist
    const addTracksResponse = await fetch(`${SPOTIFY_API_BASE}/playlists/${playlist.id}/tracks`, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uris: [testTrackUri]
      })
    });

    console.log('Add tracks response status:', addTracksResponse.status);
    
    if (!addTracksResponse.ok) {
      const errorText = await addTracksResponse.text();
      console.error('Add tracks error:', errorText);
      throw new Error(`Failed to add tracks: ${addTracksResponse.status}`);
    }

    return NextResponse.json({ 
      success: true, 
      playlistId: playlist.id,
      message: 'Test playlist created successfully'
    });
  } catch (error) {
    console.error('Error in playlist creation endpoint:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 