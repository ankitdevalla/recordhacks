'use client';

import { useEffect, useState } from 'react';
import { CalendarBusyness } from '../types';
import { getCalendarStatus } from '../utils/calendar';

export default function CalendarStatus() {
  const [calendar, setCalendar] = useState<CalendarBusyness | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchCalendarStatus() {
      try {
        console.log('Starting calendar fetch...');
        setLoading(true);
        setError(null);
        
        const calendarData = await getCalendarStatus();
        console.log('Calendar data received:', calendarData);
        
        if (isMounted) {
          setCalendar(calendarData);
          setLoading(false);
        }
      } catch (err) {
        console.error('Calendar fetch error:', err);
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch calendar data';
          setError(errorMessage);
          setLoading(false);
        }
      }
    }

    fetchCalendarStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="text-sm text-gray-600">Loading calendar data...</p>
          <p className="text-xs text-gray-500">If this takes too long, try refreshing the page</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              setLoading(true);
              setError(null);
              window.location.reload();
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!calendar) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Calendar Status</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Upcoming Events</p>
          <p className="text-lg font-medium text-gray-900">{calendar.eventCount}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Next Event</p>
          <p className="text-lg font-medium text-gray-900">
            {calendar.nextEvent.toLocaleTimeString()}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 col-span-2">
          <p className="text-sm text-gray-600 mb-1">Status</p>
          <p className="text-lg font-medium text-gray-900">
            {calendar.isBusy ? 'Busy' : 'Free'}
          </p>
        </div>
      </div>
    </div>
  );
} 