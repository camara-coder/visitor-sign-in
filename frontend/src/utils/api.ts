export const getEventStatus = async () => {
    const response = await fetch('/api/event/status');
    if (!response.ok) {
      throw new Error('Failed to fetch event status');
    }
    return response.json();
  };
  
  export const enableEvent = async () => {
    const response = await fetch('/api/event/enable', {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to enable event');
    }
    return response.json();
  };
  
  export const disableEvent = async (eventId: string) => {
    const response = await fetch(`/api/event/disable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ eventId }),
    });
    if (!response.ok) {
      throw new Error('Failed to disable event');
    }
    return response.json();
  };