# WaveLength

A personalized music recommendation app that creates playlists based on your current mood, weather conditions, and schedule. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Mood-Based Music Selection**: Choose from a variety of moods (Happy, Sad, Energetic, etc.) to influence your playlist
- **Genre Preferences**: Select multiple genres to fine-tune your music recommendations
- **Smart Duration Control**: Set your desired playlist length from 30 minutes to 3 hours
- **Contextual Awareness**:
  - Weather integration to adjust music based on current conditions
  - Calendar integration to consider your schedule and time of day
- **Personal Notes**: Add additional comments to provide more context for your playlist generation

## Tech Stack

- **Frontend Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **External APIs**:
  - Spotify API for music recommendations
  - OpenWeatherMap API for weather data
  - Google Calendar API for schedule integration
  - OpenAI for mood analysis

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/mood-music.git
cd mood-music
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
OPENWEATHER_API_KEY=your_openweather_api_key
GOOGLE_CALENDAR_CLIENT_ID=your_google_client_id
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. **Mood Selection**: Choose your current mood from the dropdown menu
2. **Genre Selection**: Select one or more preferred music genres
3. **Duration Setting**: Use the slider to set your desired playlist length
4. **Additional Context**: Add any comments or notes about your mood
5. **Smart Integration**: The app considers:
   - Your selected mood and genres
   - Current weather conditions
   - Your calendar schedule
   - Time of day
6. **Playlist Generation**: Get a personalized playlist that matches your mood and context

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
