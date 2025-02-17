'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { enableEvent, disableEvent, getEventStatus } from '../utils/api';

interface Event {
  id: string;
  status: 'enabled' | 'disabled';
  startTime: string;
  endTime: string;
  visitorCount: number;
}

export function AdminDashboard() {
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [visitors, setVisitors] = useState<Array<{
    id: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    checkInTime: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEventData = async () => {
    try {
      const eventData = await getEventStatus();
      setCurrentEvent(eventData);
      // In a real app, you would also fetch visitors data here
    } catch (error) {
      console.error('Error fetching event data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, []);

  const handleEnableEvent = async () => {
    try {
      await enableEvent();
      fetchEventData();
    } catch (error) {
      console.error('Error enabling event:', error);
      alert('Failed to enable event');
    }
  };

  const handleDisableEvent = async () => {
    if (!currentEvent?.id) return;
    
    try {
      await disableEvent(currentEvent.id);
      fetchEventData();
    } catch (error) {
      console.error('Error disabling event:', error);
      alert('Failed to disable event');
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Event Dashboard
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Event Status Section */}
        <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Event Status
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {currentEvent ? `Active since ${new Date(currentEvent.startTime).toLocaleString()}` : 'No active event'}
              </p>
            </div>
            <div>
              {currentEvent?.status === 'enabled' ? (
                <button
                  onClick={handleDisableEvent}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Disable Event
                </button>
              ) : (
                <button
                  onClick={handleEnableEvent}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Enable Event
                </button>
              )}
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        {currentEvent?.status === 'enabled' && (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Event QR Code
              </h3>
              <div className="mt-4">
                <QRCodeSVG
                  value={`${process.env.NEXT_PUBLIC_SITE_URL}/sign-in?event=${currentEvent.id}`}
                  size={200}
                />
              </div>
            </div>
          </div>
        )}

        {/* Visitors List */}
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Visitors ({visitors.length})
            </h3>
            <div className="mt-4">
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Phone
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Check-in Time
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {visitors.map((visitor) => (
                            <tr key={visitor.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {visitor.firstName} {visitor.lastName}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {visitor.phoneNumber}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(visitor.checkInTime).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}