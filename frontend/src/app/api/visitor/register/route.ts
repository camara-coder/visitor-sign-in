import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const visitorData = await request.json();

    // Validate required fields
    if (!visitorData.firstName || !visitorData.lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    // Call your AWS Lambda function here
    const response = await fetch(process.env.REGISTER_VISITOR_LAMBDA_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(visitorData),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to register visitor' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in visitor registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}