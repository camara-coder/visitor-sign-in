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
 * Lambda function to get the currently active event
 */
exports.handler = async (event) => {
  // Set response headers for CORS
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
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
    console.log('Received request to get current event');

    // Get the current active event from the database
    const currentEvent = await eventRepository.getCurrentEvent();

    if (!currentEvent) {
      console.log('No active event found');
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          status: 'error',
          error: 'NO_EVENT_AVAILABLE',
          message: 'No active event found'
        })
      };
    }

    console.log('Found active event:', currentEvent);

    // Return success response with the event
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'success',
        data: currentEvent
      })
    };
  } catch (error) {
    console.error('Error getting event:', error);
    
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