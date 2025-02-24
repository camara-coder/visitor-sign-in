const { handler } = require('./index');
const { getTestPool, clearTables, createTestEvent } = require('../test/testHelper');
const MockDate = require('mockdate');

describe('Enable Event Lambda Integration Tests', () => {
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

  it('should successfully create a new event', async () => {
    const response = await handler({});

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('success');
    expect(body.data).toHaveProperty('eventId');
    expect(body.data).toHaveProperty('startDate');
    expect(body.data).toHaveProperty('endDate');
    expect(body.data.status).toBe('enabled');

    // Verify event duration is 4 hours
    const start = new Date(body.data.startDate);
    const end = new Date(body.data.endDate);
    const durationHours = (end - start) / (1000 * 60 * 60);
    expect(durationHours).toBe(4);

    // Verify event was created in database
    const result = await getTestPool().query(
      'SELECT * FROM events WHERE id = $1',
      [body.data.eventId]
    );
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].status).toBe('enabled');
  });

  it('should return 409 when active event already exists', async () => {
    // Create an active event first
    const existingEventId = await createTestEvent(startDate, endDate, 'enabled');

    const response = await handler({});

    expect(response.statusCode).toBe(409);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('ACTIVE_EVENT_EXISTS');
    expect(body.eventId).toBe(existingEventId);
  });
});