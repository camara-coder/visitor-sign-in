const { handler } = require('./index');
const { getTestPool, clearTables, createTestEvent } = require('../test/testHelper');
const MockDate = require('mockdate');

describe('Disable Event Lambda Integration Tests', () => {
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

  it('should successfully disable an active event', async () => {
    // Create an active event
    const eventId = await createTestEvent(startDate, endDate, 'enabled');

    const response = await handler({
      pathParameters: { eventId }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('success');
    expect(body.message).toBe('Event disabled successfully');

    // Verify event was disabled in database
    const result = await getTestPool().query(
      'SELECT status FROM events WHERE id = $1',
      [eventId]
    );
    expect(result.rows[0].status).toBe('disabled');
  });

  it('should return 404 when event does not exist', async () => {
    const response = await handler({
      pathParameters: { eventId: 'non-existent-id' }
    });

    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('EVENT_NOT_FOUND');
  });

  it('should return 404 when event is already disabled', async () => {
    // Create a disabled event
    const eventId = await createTestEvent(startDate, endDate, 'disabled');

    const response = await handler({
      pathParameters: { eventId }
    });

    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('EVENT_NOT_FOUND');
  });

  it('should return 400 when eventId is missing', async () => {
    const response = await handler({
      pathParameters: {}
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('MISSING_EVENT_ID');
  });

  it('should return 400 when pathParameters is missing', async () => {
    const response = await handler({});

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('MISSING_EVENT_ID');
  });
});