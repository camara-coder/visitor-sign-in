import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;
    const lambdaUrl = process.env.GET_VISITORS_LAMBDA_URL;

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    if (!lambdaUrl) {
      console.warn('Lambda URL not configured');
      // Return mock data during build/development
      return NextResponse.json([
        {
          firstName: 'John',
          lastName: 'Doe',
          phone: '555-0123',
          address: '123 Main St',
          registrationTime: new Date().toISOString()
        }
      ]);
    }

    const response = await fetch(`${lambdaUrl}?eventId=${eventId}`, {
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
    console.error('Error fetching visitors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visitors' },
      { status: 500 }
    );
  }
}