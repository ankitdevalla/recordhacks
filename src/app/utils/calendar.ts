import { CalendarBusyness } from '../types';

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

async function getGoogleAccessToken(): Promise<string> {
  console.log('Starting OAuth flow...');
  
  if (!window.google) {
    console.error('Google API not loaded');
    throw new Error('Google API not loaded. Please check your Google Calendar Client ID configuration.');
  }

  console.log('Initializing token client...');
  return new Promise<string>((resolve, reject) => {
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/calendar.readonly',
        callback: (tokenResponse: any) => {
          console.log('OAuth callback received:', tokenResponse);
          if (tokenResponse.error) {
            console.error('OAuth callback error:', tokenResponse.error);
            reject(new Error(`OAuth Error: ${tokenResponse.error}`));
            return;
          }
          if (tokenResponse.access_token) {
            console.log('Access token received successfully');
            resolve(tokenResponse.access_token);
          } else {
            console.error('No access token in response');
            reject(new Error('No access token received'));
          }
        },
      });

      console.log('Requesting access token...');
      client.requestAccessToken();
    } catch (error) {
      console.error('Token Request Error:', error);
      reject(new Error('Failed to get Google access token'));
    }
  });
}

export async function getCalendarStatus(): Promise<CalendarBusyness> {
  try {
    console.log('Checking Google Calendar Client ID...');
    if (!process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_CLIENT_ID) {
      throw new Error('Google Calendar Client ID not configured. Please check your environment variables.');
    }

    console.log('Getting access token...');
    const accessToken = await getGoogleAccessToken();
    console.log('Access token obtained:', accessToken ? 'Yes' : 'No');

    const now = new Date();
    const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now.toISOString()}&timeMax=${endTime.toISOString()}&singleEvents=true&orderBy=startTime`;
    console.log('Fetching calendar events from:', url);
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('Calendar API response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Calendar API Error:', errorData);
      throw new Error(`Calendar API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('Calendar API response data:', JSON.stringify(data, null, 2));
    
    const events = data.items || [];
    console.log('Number of events found:', events.length);

    // Get the next event
    const nextEvent = events[0]?.start?.dateTime || events[0]?.start?.date;
    const nextEventTime = nextEvent ? new Date(nextEvent) : new Date(now.getTime() + 24 * 60 * 60 * 1000);
    console.log('Next event time:', nextEventTime);

    const calendarStatus = {
      eventCount: events.length,
      nextEvent: nextEventTime,
      isBusy: events.some((event: any) => {
        const eventStart = new Date(event.start.dateTime || event.start.date);
        const eventEnd = new Date(event.end.dateTime || event.end.date);
        return now >= eventStart && now <= eventEnd;
      }),
    };
    
    console.log('Returning calendar status:', calendarStatus);
    return calendarStatus;
  } catch (error) {
    console.error('Calendar Status Error:', error);
    throw error;
  }
} 