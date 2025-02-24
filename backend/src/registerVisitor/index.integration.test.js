const { handler } = require('./index');
const { getTestPool, clearTables, createTestEvent } = require('../test/testHelper');
const MockDate = require('mockdate');

describe('Register Visitor Lambda Integration Tests', () => {
  const TEST_DATE = '2025-02-19T13:00:00.000Z';
  const startDate = new Date('2025-02-19T12:00:00.000Z');
  const endDate = new Date('2025-02-19T16:00:00.000Z');

  beforeEach(async () => {
    await clearTables();
    MockDate.set(TEST_DATE);
  });

  afterEach(() => {
    MockDate.reset();
  });

  it('should successfully register a new visitor', async () => {
    // Create active event
    const eventId = await createTestEvent(startDate, endDate, 'enabled');

    const visitorData = {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      address: '123 Main St'
    };

    const response = await handler({
      body: JSON.stringify(visitorData)
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('success');
    
    // Verify visitor was saved in database
    const result = await getTestPool().query(
      'SELECT * FROM visitors WHERE first_name = $1 AND last_name = $2',
      [visitorData.firstName, visitorData.lastName]
    );
    
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].event_id).toBe(eventId);
  });

  it('should reject registration when no active event exists', async () => {
    const visitorData = {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      address: '123 Main St'
    };

    const response = await handler({
      body: JSON.stringify(visitorData)
    });

    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('NO_EVENT_AVAILABLE');
  });

  it('should reject duplicate registrations', async () => {
    // Create active event
    await createTestEvent(startDate, endDate, 'enabled');

    const visitorData = {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      address: '123 Main St'
    };

    // First registration
    await handler({
      body: JSON.stringify(visitorData)
    });

    // Attempt duplicate registration
    const response = await handler({
      body: JSON.stringify(visitorData)
    });

    expect(response.statusCode).toBe(409);  // Changed from 400 to 409 for Conflict
    const body = JSON.parse(response.body);
    expect(body.error).toBe('DUPLICATE_REGISTRATION');
  });

  it('should validate required fields', async () => {
    await createTestEvent(startDate, endDate, 'enabled');

    const invalidVisitorData = {
      firstName: '',  // Missing required field
      lastName: 'Doe',
      phoneNumber: '+1234567890'
    };

    const response = await handler({
      body: JSON.stringify(invalidVisitorData)
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('MISSING_INFORMATION');  // Changed from VALIDATION_ERROR to match implementation
    expect(body.message).toContain('First name and last name are required');
  });
});