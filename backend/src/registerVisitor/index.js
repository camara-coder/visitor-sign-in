// Handle both local development and AWS Lambda environments
let visitorRepository;
try {
  // Try loading from Lambda Layer path
  visitorRepository = require('/opt/nodejs/repositories/visitorRepository');
} catch (error) {
  // Fall back to local path for development
  console.log('Loading repository from local path for development');
  visitorRepository = require('../../layers/common/nodejs/repositories/visitorRepository');
}

/**
 * Validates visitor data
 * @param {Object} visitor - Visitor data
 * @returns {Object} - Validation result
 */
const validateVisitor = (visitor) => {
  if (!visitor.firstName || !visitor.lastName) {
    return {
      isValid: false,
      error: 'MISSING_INFORMATION',
      message: 'First name and last name are required'
    };
  }

  if (visitor.phoneNumber && !/^\+?[\d\s-]{10,}$/.test(visitor.phoneNumber)) {
    return {
      isValid: false,
      error: 'INVALID_PHONE',
      message: 'Invalid phone number format'
    };
  }

  return { isValid: true };
};

/**
 * Lambda function to register a visitor for an event
 */
exports.handler = async (event) => {
  // Set response headers for CORS
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    console.log('Received event:', event);
    
    // Parse visitor data from the request body
    const visitor = JSON.parse(event.body);
    console.log('Parsed visitor data:', visitor);
    
    // Validate visitor data
    const validation = validateVisitor(visitor);
    if (!validation.isValid) {
      console.log('Validation failed:', validation);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          status: 'error',
          error: validation.error,
          message: validation.message
        })
      };
    }

    // Get current event
    const currentEvent = await visitorRepository.getCurrentEvent(
      event.timestamp ? new Date(event.timestamp) : new Date()
    );
    console.log('Current event:', currentEvent);
    
    if (!currentEvent) {
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

    // Check for duplicate registration
    const isDuplicate = await visitorRepository.checkDuplicateRegistration(
      currentEvent.id,
      visitor.firstName,
      visitor.lastName
    );

    if (isDuplicate) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({
          status: 'error',
          error: 'DUPLICATE_REGISTRATION',
          message: 'Visitor already registered for this event'
        })
      };
    }

    // Save visitor registration
    const registeredVisitor = await visitorRepository.registerVisitor(currentEvent.id, visitor);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'success',
        message: 'Registration successful',
        data: registeredVisitor
      })
    };

  } catch (error) {
    console.error('Error in register-visitor:', error);
    
    if (error.message === 'NO_EVENT_AVAILABLE') {
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
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'error',
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      })
    };
  }
};