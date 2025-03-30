'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { handleSpotifyCallback } from '../../../utils/spotify';

export default function SpotifyCallback() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');

        if (!code || !state) {
          throw new Error('Missing code or state');
        }

        await handleSpotifyCallback(code, state);
        router.push('/'); // Redirect back to home page
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/?error=authentication_failed');
      }
    }

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Authenticating with Spotify...</p>
      </div>
    </div>
  );
} 