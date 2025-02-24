const { handler } = require('./index');
const { getTestPool, clearTables, createTestEvent } = require('../test/testHelper');
const { v4: uuidv4 } = require('uuid');

describe('Get Event Lambda', () => {
  const testTimestamp = new Date('2025-02-19T13:00:00.000Z');
  const startDate = new Date('2025-02-19T12:00:00.000Z');
  const endDate = new Date('2025-02-19T16:00:00.000Z');

  beforeEach(async () => {
    await clearTables();
  });

  it('should return the current active event', async () => {
    // Create an active event and save its ID
    const eventId = await createTestEvent(startDate, endDate, 'enabled');
    const eventCheck = await getTestPool().query('SELECT * FROM events WHERE id = $1', [eventId]);
    console.log('Created event:', eventCheck.rows[0]);

    const response = await handler({ timestamp: testTimestamp.toISOString() });
    console.log('Get event response:', response);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('success');
    expect(body.data.eventId).toBe(eventId);
    expect(new Date(body.data.startDate)).toEqual(startDate);
    expect(new Date(body.data.endDate)).toEqual(endDate);
    expect(body.data.status).toBe('enabled');
  });

  it('should return 404 when no active event exists', async () => {
    const response = await handler({});
    console.log('Get event response (no event):', response);

    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('NO_EVENT_AVAILABLE');
  });

  it('should return 404 when event exists but is outside time window', async () => {
    // Create an event but test with timestamp before event starts
    await createTestEvent(startDate, endDate, 'enabled');
    const earlyTimestamp = new Date('2025-02-19T11:00:00.000Z'); // 1 hour before start

    const response = await handler({ timestamp: earlyTimestamp.toISOString() });
    console.log('Get event response (outside window):', response);

    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('NO_EVENT_AVAILABLE');
  });

  it('should return 404 when event exists but is disabled', async () => {
    // Create a disabled event
    await createTestEvent(startDate, endDate, 'disabled');

    const response = await handler({ timestamp: testTimestamp.toISOString() });
    console.log('Get event response (disabled):', response);

    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('NO_EVENT_AVAILABLE');
  });
});