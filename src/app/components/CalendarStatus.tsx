'use client';

import { useEffect, useState } from 'react';
import { CalendarBusyness } from '../types';

export default function CalendarStatus() {
  const [calendar, setCalendar] = useState<CalendarBusyness | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCalendarStatus() {
      try {
        // TODO: Implement Google Calendar API integration
        // For now, using mock data
        const mockData: CalendarBusyness = {
          eventCount: 3,
          nextEvent: new Date(Date.now() + 3600000), // 1 hour from now
          isBusy: true,
        };
        setCalendar(mockData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch calendar data');
      } finally {
        setLoading(false);
      }
    }

    fetchCalendarStatus();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center text-red-600">
        <p>{error}</p>
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