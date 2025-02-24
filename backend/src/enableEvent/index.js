const { v4: uuidv4 } = require('uuid');

// Handle both local development and AWS Lambda environments
let eventRepository;
try {
  // Try loading from Lambda Layer path
  eventRepository = require('/opt/nodejs/repositories/eventRepository');
} catch (error) {
  // Fall back to local path for development
  console.log('Loading repository from local path for development');
  eventRepository = require('../../layers/common/nodejs/repositories/eventRepository');
}
/**
 * Lambda function to enable a new event
 */
exports.handler = async (event) => {
  // Set response headers for CORS
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // Handle OPTIONS request (for CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight successful' })
    };
  }

  try {
    console.log('Received request to enable event');
    
    // Parse request body if available
    let requestBody = {};
    if (event.body) {
      try {
        requestBody = JSON.parse(event.body);
      } catch (e) {
        console.warn('Could not parse request body:', e);
      }
    }

    // Check if user is authenticated (implement proper auth in production)
    // This is a placeholder for future authentication checks
    if (event.requestContext && event.requestContext.authorizer) {
      // Authenticated user from Cognito, API Gateway, etc.
      console.log('User authenticated via API Gateway authorizer');
    } else {
      // For development, continue without authentication
      // In production, you would return a 401 Unauthorized response
      console.log('Development mode: proceeding without authentication');
    }

    // Generate event ID and timestamps
    const eventId = uuidv4();
    const startTime = new Date();
    // Use provided end time or default to 4 hours later
    const endTime = requestBody.endTime 
      ? new Date(requestBody.endTime) 
      : new Date(startTime.getTime() + (4 * 60 * 60 * 1000));

    // Create event object
    const newEvent = {
      id: eventId,
      status: 'enabled',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    };

    console.log('Saving event to database:', newEvent);

    // Save event to database
    const savedEvent = await eventRepository.createEvent(newEvent);
    
    console.log('Event successfully saved:', savedEvent);

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'success',
        data: savedEvent
      })
    };
  } catch (error) {
    console.error('Error enabling event:', error);
    
    // Return error response
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'error',
        error: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Internal server error'
      })
    };
  }
};