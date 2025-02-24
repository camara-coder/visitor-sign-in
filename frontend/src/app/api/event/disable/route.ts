import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const lambdaUrl = process.env.DISABLE_EVENT_LAMBDA_URL;
    const body = await request.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    if (!lambdaUrl) {
      console.warn('Lambda URL not configured');
      // Return mock response during build/development
      return NextResponse.json({
        id: eventId,
        status: 'disabled',
        message: 'Event disabled successfully'
      });
    }

    const response = await fetch(lambdaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ eventId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error disabling event:', error);
    return NextResponse.json(
      { error: 'Failed to disable event' },
      { status: 500 }
    );
  }
}