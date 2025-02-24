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
 * Lambda function to disable an event
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
    console.log('Received request to disable event');
    
    // Parse request body to get eventId
    let eventId;
    if (event.body) {
      try {
        const body = JSON.parse(event.body);
        eventId = body.eventId;
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

    if (!eventId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          status: 'error',
          error: 'MISSING_EVENT_ID',
          message: 'Event ID is required'
        })
      };
    }

    console.log(`Disabling event with ID: ${eventId}`);

    // Disable the event in the database
    const disabledEvent = await eventRepository.disableEvent(eventId);

    if (!disabledEvent) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          status: 'error',
          error: 'EVENT_NOT_FOUND',
          message: 'Event not found'
        })
      };
    }

    console.log('Event successfully disabled:', disabledEvent);

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'success',
        data: disabledEvent
      })
    };
  } catch (error) {
    console.error('Error disabling event:', error);
    
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