'use client';

import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

interface Event {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
}

interface Visitor {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  registrationTime: string;
}

const AdminDashboard: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (username === 'admin' && password === 'password') {
        setIsLoggedIn(true);
        setError('');
        fetchCurrentEvent();
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  const fetchCurrentEvent = async () => {
    try {
      const response = await fetch('/api/event');
      const data = await response.json();
      setCurrentEvent(data);
    } catch (err) {
      console.error('Error fetching event:', err);
    }
  };

  const handleEnableEvent = async () => {
    try {
      const response = await fetch('/api/event/enable', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || 'Failed to enable event');
      }

      console.log('Event enabled successfully:', data);
      fetchCurrentEvent();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enable event';
      console.error('Error enabling event:', err);
      setError(errorMessage);
    }
  };

  const handleDisableEvent = async () => {
    try {
      if (currentEvent?.id) {
        const response = await fetch('/api/event/disable', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ eventId: currentEvent.id }),
        });
        if (!response.ok) throw new Error('Failed to disable event');
        fetchCurrentEvent();
      }
    } catch (err) {
      setError('Failed to disable event');
    }
  };

  const fetchVisitors = async () => {
    if (currentEvent?.id) {
      try {
        const response = await fetch(`/api/visitors/${currentEvent.id}`);
        const data = await response.json();
        setVisitors(data);
      } catch (err) {
        console.error('Error fetching visitors:', err);
      }
    }
  };

  useEffect(() => {
    if (currentEvent?.id) {
      fetchVisitors();
    }
  }, [currentEvent]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex align-items-center justify-content-center">
        <Card title="Admin Login" className="w-30rem">
          <form onSubmit={handleLogin} className="flex flex-column gap-2">
            <div className="flex flex-column gap-2">
              <label htmlFor="username">Username</label>
              <InputText
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-column gap-2">
              <label htmlFor="password">Password</label>
              <InputText
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <Button
              type="submit"
              label="Login"
              className="mt-2"
            />
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto flex flex-column gap-4">
        <Card title="Event Management">
          <div className="flex flex-column gap-3">
            <div className="flex gap-2">
              <Button
                label="Enable New Event"
                severity="success"
                onClick={handleEnableEvent}
                disabled={currentEvent?.status === 'enabled'}
              />
              <Button
                label="Disable Current Event"
                severity="danger"
                onClick={handleDisableEvent}
                disabled={!currentEvent || currentEvent?.status === 'disabled'}
              />
            </div>
            {currentEvent && (
              <div className="mt-4">
                <h3 className="text-xl font-medium">Current Event</h3>
                <p>Status: {currentEvent.status}</p>
                <p>Start: {new Date(currentEvent.startTime).toLocaleString()}</p>
                <p>End: {new Date(currentEvent.endTime).toLocaleString()}</p>
              </div>
            )}
          </div>
        </Card>

        <Card title="Visitor List">
          <DataTable value={visitors} stripedRows>
            <Column field="firstName" header="First Name" />
            <Column field="lastName" header="Last Name" />
            <Column field="phone" header="Phone" />
            <Column field="address" header="Address" />
            <Column 
              field="registrationTime" 
              header="Registration Time"
              body={(rowData) => new Date(rowData.registrationTime).toLocaleString()} 
            />
          </DataTable>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;