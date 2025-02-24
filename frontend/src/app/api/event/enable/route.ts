import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const lambdaUrl = process.env.ENABLE_EVENT_LAMBDA_URL;
    
    if (!lambdaUrl) {
      console.warn('Lambda URL not configured, returning mock data');
      return NextResponse.json({
        id: 'mock-event-id',
        status: 'enabled',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
      });
    }

    console.log('Calling Lambda URL:', lambdaUrl);

    const response = await fetch(lambdaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
      })
    });

    console.log('Lambda response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lambda error response:', errorText);
      
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('Lambda success response:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in enable-event route:', error);
    
    // Return a more detailed error response
    return NextResponse.json(
      { 
        error: 'Failed to enable event',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}