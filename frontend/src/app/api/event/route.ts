import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const lambdaUrl = process.env.GET_EVENT_LAMBDA_URL;
    
    if (!lambdaUrl) {
      console.warn('Lambda URL not configured');
      // Return mock data during build/development
      return NextResponse.json({
        id: 'mock-event-id',
        status: 'disabled',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
      });
    }

    const response = await fetch(lambdaUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching event:', error);
    // Return mock data on error
    return NextResponse.json({
      id: 'mock-event-id',
      status: 'disabled',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
    });
  }
}